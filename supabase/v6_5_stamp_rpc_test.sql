-- CHỈ CHẠY TRÊN SUPABASE test_2010. Sao lưu trước khi chạy.
-- Bảng dấu thương: không cấp quyền trực tiếp cho anon/authenticated.
CREATE TABLE IF NOT EXISTS public.memory_love_stamps (
  photo_key text PRIMARY KEY,
  stamped_at timestamptz NOT NULL DEFAULT now(),
  stamp_type text NOT NULL DEFAULT 'both_loved' CHECK (stamp_type = 'both_loved')
);
ALTER TABLE public.memory_love_stamps ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.memory_love_stamps FROM PUBLIC, anon, authenticated;

-- Di chuyển các ảnh đã có đủ hai tim sang trạng thái đóng dấu (chỉ thực hiện khi nâng cấp).
INSERT INTO public.memory_love_stamps (photo_key, stamped_at)
SELECT photo_key, MAX(created_at)
FROM public.memory_photo_likes
GROUP BY photo_key
HAVING COUNT(DISTINCT liker_role) = 2
ON CONFLICT (photo_key) DO NOTHING;

-- Chỉ service_role được gọi RPC; lock cho từng ảnh để không đóng dấu trùng khi 2 request đồng thời.
CREATE OR REPLACE FUNCTION public.memory_set_love(p_photo_key text, p_role text, p_liked boolean, p_first_id bigint)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id bigint;
  v_index integer;
  v_images jsonb;
  v_exists boolean := false;
  v_stamp timestamptz;
  v_just_stamped boolean := false;
  v_roles jsonb;
BEGIN
  IF p_role NOT IN ('anh', 'em') OR p_liked IS NULL OR
     NOT (p_photo_key = 'first' OR p_photo_key ~ '^entry:[1-9][0-9]*:[0-5]$') THEN
    RAISE EXCEPTION 'INVALID_INPUT';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_photo_key, 4137));

  IF p_photo_key = 'first' THEN
    -- Chỉ cho tim ảnh đầu tiên được chọn; id được server kiểm tra thêm trước RPC.
    SELECT EXISTS (SELECT 1 FROM public.love_messages WHERE id = p_first_id AND image_url IS NOT NULL) INTO v_exists;
  ELSE
    v_id := split_part(p_photo_key, ':', 2)::bigint;
    v_index := split_part(p_photo_key, ':', 3)::integer;
    SELECT to_jsonb(image_urls) INTO v_images FROM public.memory_entries WHERE id = v_id;
    v_exists := jsonb_typeof(v_images) = 'array' AND jsonb_typeof(v_images -> v_index) = 'string';
  END IF;
  IF NOT v_exists THEN RAISE EXCEPTION 'PHOTO_NOT_FOUND'; END IF;

  SELECT stamped_at INTO v_stamp FROM public.memory_love_stamps WHERE photo_key = p_photo_key;
  IF v_stamp IS NULL THEN
    IF p_liked THEN
      INSERT INTO public.memory_photo_likes (photo_key, liker_role)
      VALUES (p_photo_key, p_role) ON CONFLICT DO NOTHING;
    ELSE
      DELETE FROM public.memory_photo_likes WHERE photo_key = p_photo_key AND liker_role = p_role;
    END IF;
    IF (SELECT count(DISTINCT liker_role) FROM public.memory_photo_likes WHERE photo_key = p_photo_key) = 2 THEN
      INSERT INTO public.memory_love_stamps (photo_key) VALUES (p_photo_key) ON CONFLICT DO NOTHING
      RETURNING stamped_at INTO v_stamp;
      v_just_stamped := v_stamp IS NOT NULL;
    END IF;
  END IF;
  SELECT COALESCE(jsonb_agg(liker_role ORDER BY liker_role), '[]'::jsonb) INTO v_roles
  FROM public.memory_photo_likes WHERE photo_key = p_photo_key;
  RETURN jsonb_build_object('photo_key', p_photo_key, 'roles', v_roles,
      'stamped_at', v_stamp, 'just_stamped', v_just_stamped);
END;
$$;
-- Security definer được khóa quyền RPC; chỉ backend service_role được thực thi.
REVOKE ALL ON FUNCTION public.memory_set_love(text,text,boolean,bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.memory_set_love(text,text,boolean,bigint) TO service_role;
