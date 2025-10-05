--
-- PostgreSQL database dump
--

\restrict UHldlw6WbWR9306sjmVTx731c3en1zSKf9Ue9B5L4da6hfCxLX09Ew1uffw6uWZ

-- Dumped from database version 15.14 (Homebrew)
-- Dumped by pg_dump version 15.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_albums_image_count(); Type: FUNCTION; Schema: public; Owner: ninh
--

CREATE FUNCTION public.update_albums_image_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE albums SET image_count = image_count + 1 WHERE id = NEW.album_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE albums SET image_count = image_count - 1 WHERE id = OLD.album_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_albums_image_count() OWNER TO ninh;

--
-- Name: update_albums_updated_at(); Type: FUNCTION; Schema: public; Owner: ninh
--

CREATE FUNCTION public.update_albums_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_albums_updated_at() OWNER TO ninh;

--
-- Name: update_event_image_count(); Type: FUNCTION; Schema: public; Owner: ninh
--

CREATE FUNCTION public.update_event_image_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events 
    SET image_count = image_count + 1 
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET image_count = GREATEST(0, image_count - 1) 
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_event_image_count() OWNER TO ninh;

--
-- Name: update_events_updated_at(); Type: FUNCTION; Schema: public; Owner: ninh
--

CREATE FUNCTION public.update_events_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_events_updated_at() OWNER TO ninh;

--
-- Name: update_project_image_count(); Type: FUNCTION; Schema: public; Owner: ninh
--

CREATE FUNCTION public.update_project_image_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects 
    SET image_count = image_count + 1 
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects 
    SET image_count = GREATEST(0, image_count - 1) 
    WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_project_image_count() OWNER TO ninh;

--
-- Name: update_projects_updated_at(); Type: FUNCTION; Schema: public; Owner: ninh
--

CREATE FUNCTION public.update_projects_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_projects_updated_at() OWNER TO ninh;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: album_images; Type: TABLE; Schema: public; Owner: ninh
--

CREATE TABLE public.album_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    album_id uuid NOT NULL,
    image_url text NOT NULL,
    image_id character varying(255),
    caption text,
    display_order integer DEFAULT 0,
    added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    added_by character varying(255) DEFAULT 'system'::character varying
);


ALTER TABLE public.album_images OWNER TO ninh;

--
-- Name: TABLE album_images; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON TABLE public.album_images IS 'Bảng quản lý ảnh trong albums';


--
-- Name: albums; Type: TABLE; Schema: public; Owner: ninh
--

CREATE TABLE public.albums (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    cover_image_url text,
    cover_image_id character varying(255),
    category character varying(50),
    tags text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255) DEFAULT 'system'::character varying,
    is_active boolean DEFAULT true,
    image_count integer DEFAULT 0
);


ALTER TABLE public.albums OWNER TO ninh;

--
-- Name: TABLE albums; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON TABLE public.albums IS 'Albums đã được tạo với sample data';


--
-- Name: COLUMN albums.category; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON COLUMN public.albums.category IS 'Loại album: fabric (vải), project (công trình), event (sự kiện)';


--
-- Name: COLUMN albums.image_count; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON COLUMN public.albums.image_count IS 'Số lượng ảnh trong album (tự động cập nhật)';


--
-- Name: employees; Type: TABLE; Schema: public; Owner: ninh
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    "position" character varying(100)
);


ALTER TABLE public.employees OWNER TO ninh;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: ninh
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employees_id_seq OWNER TO ninh;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ninh
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: event_images; Type: TABLE; Schema: public; Owner: ninh
--

CREATE TABLE public.event_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    image_id uuid,
    image_url text NOT NULL,
    image_name character varying(255),
    thumbnail_url text,
    sort_order integer DEFAULT 0,
    caption text,
    added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    added_by character varying(255) DEFAULT 'system'::character varying NOT NULL
);


ALTER TABLE public.event_images OWNER TO ninh;

--
-- Name: TABLE event_images; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON TABLE public.event_images IS 'Bảng lưu trữ ảnh của các sự kiện';


--
-- Name: events; Type: TABLE; Schema: public; Owner: ninh
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    event_type character varying(50),
    event_date date,
    location character varying(255),
    organizer character varying(255),
    attendees_count integer DEFAULT 0,
    cover_image_url text,
    cover_image_id uuid,
    image_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255) DEFAULT 'system'::character varying NOT NULL,
    is_active boolean DEFAULT true,
    tags text[],
    status character varying(50) DEFAULT 'upcoming'::character varying,
    CONSTRAINT events_event_type_check CHECK (((event_type)::text = ANY ((ARRAY['company_party'::character varying, 'team_building'::character varying, 'training'::character varying, 'conference'::character varying, 'award_ceremony'::character varying, 'anniversary'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT events_status_check CHECK (((status)::text = ANY ((ARRAY['upcoming'::character varying, 'ongoing'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.events OWNER TO ninh;

--
-- Name: TABLE events; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON TABLE public.events IS 'Bảng quản lý các sự kiện/hoạt động nội bộ công ty';


--
-- Name: COLUMN events.event_type; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON COLUMN public.events.event_type IS 'Loại sự kiện: company_party, team_building, training, conference, award_ceremony, anniversary, other';


--
-- Name: COLUMN events.attendees_count; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON COLUMN public.events.attendees_count IS 'Số lượng người tham gia';


--
-- Name: COLUMN events.status; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON COLUMN public.events.status IS 'Trạng thái: upcoming, ongoing, completed, cancelled';


--
-- Name: project_fabrics; Type: TABLE; Schema: public; Owner: ninh
--

CREATE TABLE public.project_fabrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    fabric_id uuid,
    fabric_code character varying(100),
    fabric_name character varying(255),
    quantity numeric(10,2),
    room_type character varying(100),
    notes text,
    added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    added_by character varying(255) DEFAULT 'system'::character varying
);


ALTER TABLE public.project_fabrics OWNER TO ninh;

--
-- Name: TABLE project_fabrics; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON TABLE public.project_fabrics IS 'Bảng liên kết giữa công trình và vải sử dụng';


--
-- Name: COLUMN project_fabrics.quantity; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON COLUMN public.project_fabrics.quantity IS 'Số lượng vải sử dụng (đơn vị: mét)';


--
-- Name: COLUMN project_fabrics.room_type; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON COLUMN public.project_fabrics.room_type IS 'Loại phòng sử dụng vải: phòng khách, phòng ngủ, bếp, phòng tắm, hành lang, ban công...';


--
-- Name: project_images; Type: TABLE; Schema: public; Owner: ninh
--

CREATE TABLE public.project_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    image_id uuid,
    image_url text NOT NULL,
    image_name character varying(255),
    thumbnail_url text,
    sort_order integer DEFAULT 0,
    caption text,
    room_type character varying(100),
    added_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    added_by character varying(255) DEFAULT 'system'::character varying NOT NULL
);


ALTER TABLE public.project_images OWNER TO ninh;

--
-- Name: TABLE project_images; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON TABLE public.project_images IS 'Bảng lưu trữ ảnh của các dự án';


--
-- Name: COLUMN project_images.room_type; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON COLUMN public.project_images.room_type IS 'Loại phòng: living room, bedroom, kitchen, bathroom, etc.';


--
-- Name: projects; Type: TABLE; Schema: public; Owner: ninh
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    project_type character varying(50),
    location character varying(255),
    client_name character varying(255),
    completion_date date,
    cover_image_url text,
    cover_image_id uuid,
    image_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(255) DEFAULT 'system'::character varying NOT NULL,
    is_active boolean DEFAULT true,
    tags text[],
    status character varying(50) DEFAULT 'planning'::character varying,
    CONSTRAINT projects_project_type_check CHECK (((project_type)::text = ANY ((ARRAY['residential'::character varying, 'commercial'::character varying, 'office'::character varying, 'retail'::character varying, 'hospitality'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT projects_status_check CHECK (((status)::text = ANY ((ARRAY['planning'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.projects OWNER TO ninh;

--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON TABLE public.projects IS 'Bảng quản lý các dự án/công trình';


--
-- Name: COLUMN projects.project_type; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON COLUMN public.projects.project_type IS 'Loại dự án: residential, commercial, office, retail, hospitality, other';


--
-- Name: COLUMN projects.status; Type: COMMENT; Schema: public; Owner: ninh
--

COMMENT ON COLUMN public.projects.status IS 'Trạng thái: planning, in_progress, completed, archived';


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Data for Name: album_images; Type: TABLE DATA; Schema: public; Owner: ninh
--

COPY public.album_images (id, album_id, image_url, image_id, caption, display_order, added_at, added_by) FROM stdin;
ec437fca-40d7-480d-9a46-8f1c0f935ff3	7acfdac9-b3e4-4841-9ed3-031291ee79a1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5449&cache_key="5449_1759473933"&type="unit"&size="xl"	5449	Ảnh mẫu 1	1	2025-10-04 10:20:46.30951+07	system
87843c47-d35c-4d23-a43a-1ee13e660437	92faa1a3-d767-4152-b65f-867b983e1cb7	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5450&cache_key="5450_1759473933"&type="unit"&size="xl"	5450	Ảnh mẫu 2	2	2025-10-04 10:20:46.30951+07	system
250580e2-5cde-49c2-af38-4118c1d68f5c	f1476544-54ee-43e1-b954-79ef42ca73c1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5451&cache_key="5451_1759473933"&type="unit"&size="xl"	5451	Ảnh mẫu 3	3	2025-10-04 10:20:46.30951+07	system
3b8a2c9a-04af-4442-b50f-ac578b94f7b4	860ed3b7-e96f-4443-9fce-46b8bb7727bf	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5452&cache_key="5452_1759473933"&type="unit"&size="xl"	5452	Ảnh mẫu 4	4	2025-10-04 10:20:46.30951+07	system
f7e7d9ae-393f-49c8-9027-eac54046370d	f70f4c29-c2c9-447f-9301-231983449e99	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5453&cache_key="5453_1759473933"&type="unit"&size="xl"	5453	Ảnh mẫu 5	5	2025-10-04 10:20:46.30951+07	system
d0bcc1dc-25ad-48ed-80d1-f519ecfdd827	da20ad0b-6975-4532-8c05-cf46132780aa	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5454&cache_key="5454_1759473933"&type="unit"&size="xl"	5454	Ảnh mẫu 6	6	2025-10-04 10:20:46.30951+07	system
d0bfd210-9606-46a2-8a30-a2dc1a632536	a9d4f4fe-5b2a-4cdd-90b2-54b456324d6c	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5455&cache_key="5455_1759473933"&type="unit"&size="xl"	5455	Ảnh mẫu 7	7	2025-10-04 10:20:46.30951+07	system
7dec9bcd-0eb3-42b9-a74f-68e21e0113ca	e11d7c4c-9cf5-4007-bd5a-10c1ea8a8636	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5456&cache_key="5456_1759473933"&type="unit"&size="xl"	5456	Ảnh mẫu 8	8	2025-10-04 10:20:46.30951+07	system
1722fa84-e5e6-416b-bd08-be988aea3b99	d8791827-6c5c-4661-99b2-9fa0f51031cf	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5457&cache_key="5457_1759473933"&type="unit"&size="xl"	5457	Ảnh mẫu 9	9	2025-10-04 10:20:46.30951+07	system
1c575be2-e859-45ee-b056-da6ff887b7a5	6afbc2ff-af66-4e8b-90de-1c96dbe77f86	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5458&cache_key="5458_1759473933"&type="unit"&size="xl"	5458	Ảnh mẫu 10	10	2025-10-04 10:20:46.30951+07	system
7d4244e7-d4b2-4e44-b943-fc6493c978c7	7acfdac9-b3e4-4841-9ed3-031291ee79a1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5459&cache_key="5459_1759473933"&type="unit"&size="xl"	5459	Ảnh mẫu 11	11	2025-10-04 10:20:46.30951+07	system
a1b15eb0-ad78-4063-939f-4b84b59e2c0c	92faa1a3-d767-4152-b65f-867b983e1cb7	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5460&cache_key="5460_1759473933"&type="unit"&size="xl"	5460	Ảnh mẫu 12	12	2025-10-04 10:20:46.30951+07	system
4133fed5-bc79-49b4-be36-7919d83af348	f1476544-54ee-43e1-b954-79ef42ca73c1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5461&cache_key="5461_1759473933"&type="unit"&size="xl"	5461	Ảnh mẫu 13	13	2025-10-04 10:20:46.30951+07	system
ecdab2fb-cdcf-4c4f-8a59-f2af7504a5ef	860ed3b7-e96f-4443-9fce-46b8bb7727bf	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5462&cache_key="5462_1759473933"&type="unit"&size="xl"	5462	Ảnh mẫu 14	14	2025-10-04 10:20:46.30951+07	system
a09b54bb-683a-4d92-a495-41f687b4ac69	f70f4c29-c2c9-447f-9301-231983449e99	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5463&cache_key="5463_1759473933"&type="unit"&size="xl"	5463	Ảnh mẫu 15	15	2025-10-04 10:20:46.30951+07	system
4cfafe58-3a4a-4485-b3f5-45f4826d9a1c	da20ad0b-6975-4532-8c05-cf46132780aa	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5464&cache_key="5464_1759473933"&type="unit"&size="xl"	5464	Ảnh mẫu 16	16	2025-10-04 10:20:46.30951+07	system
f5b7a27f-78e8-493a-a6ca-db4f1a73930a	a9d4f4fe-5b2a-4cdd-90b2-54b456324d6c	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5465&cache_key="5465_1759473933"&type="unit"&size="xl"	5465	Ảnh mẫu 17	17	2025-10-04 10:20:46.30951+07	system
93fedc18-c8fd-46cb-ac7c-5b34381ee9d1	e11d7c4c-9cf5-4007-bd5a-10c1ea8a8636	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5466&cache_key="5466_1759473933"&type="unit"&size="xl"	5466	Ảnh mẫu 18	18	2025-10-04 10:20:46.30951+07	system
1a7df528-7ee8-4533-ab01-652336d479ed	d8791827-6c5c-4661-99b2-9fa0f51031cf	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5467&cache_key="5467_1759473933"&type="unit"&size="xl"	5467	Ảnh mẫu 19	19	2025-10-04 10:20:46.30951+07	system
5b084980-f84b-4303-b863-1d445f39a3a6	6afbc2ff-af66-4e8b-90de-1c96dbe77f86	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5468&cache_key="5468_1759473933"&type="unit"&size="xl"	5468	Ảnh mẫu 20	20	2025-10-04 10:20:46.30951+07	system
c8a7d402-4aca-43b9-b803-42ac334085c9	7acfdac9-b3e4-4841-9ed3-031291ee79a1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5469&cache_key="5469_1759473933"&type="unit"&size="xl"	5469	Ảnh mẫu 21	21	2025-10-04 10:20:46.30951+07	system
b085d73d-7973-46c8-a8b2-ed74ae5de4ec	92faa1a3-d767-4152-b65f-867b983e1cb7	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5470&cache_key="5470_1759473933"&type="unit"&size="xl"	5470	Ảnh mẫu 22	22	2025-10-04 10:20:46.30951+07	system
26ac5d34-d088-43af-b7ec-b54e8cf7d668	f1476544-54ee-43e1-b954-79ef42ca73c1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5471&cache_key="5471_1759473933"&type="unit"&size="xl"	5471	Ảnh mẫu 23	23	2025-10-04 10:20:46.30951+07	system
b5e03371-1c83-4f5b-8efb-821b9cc2ad60	860ed3b7-e96f-4443-9fce-46b8bb7727bf	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5472&cache_key="5472_1759473933"&type="unit"&size="xl"	5472	Ảnh mẫu 24	24	2025-10-04 10:20:46.30951+07	system
ef70b92d-c908-4c72-a45b-3af25a8342b4	f70f4c29-c2c9-447f-9301-231983449e99	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5473&cache_key="5473_1759473933"&type="unit"&size="xl"	5473	Ảnh mẫu 25	25	2025-10-04 10:20:46.30951+07	system
88d9c84c-c079-47d5-9c89-6f89b25e4ac2	da20ad0b-6975-4532-8c05-cf46132780aa	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5474&cache_key="5474_1759473933"&type="unit"&size="xl"	5474	Ảnh mẫu 26	26	2025-10-04 10:20:46.30951+07	system
f64424ac-6ef9-4e14-90c4-346009e01e5e	a9d4f4fe-5b2a-4cdd-90b2-54b456324d6c	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5475&cache_key="5475_1759473933"&type="unit"&size="xl"	5475	Ảnh mẫu 27	27	2025-10-04 10:20:46.30951+07	system
7fa9b91e-4b8e-45cf-a92f-c1cbc268a7d0	e11d7c4c-9cf5-4007-bd5a-10c1ea8a8636	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5476&cache_key="5476_1759473933"&type="unit"&size="xl"	5476	Ảnh mẫu 28	28	2025-10-04 10:20:46.30951+07	system
05b3ecff-4153-404d-9649-547dd93f5ee6	d8791827-6c5c-4661-99b2-9fa0f51031cf	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5477&cache_key="5477_1759473933"&type="unit"&size="xl"	5477	Ảnh mẫu 29	29	2025-10-04 10:20:46.30951+07	system
7719e6bc-7e10-44bd-9c52-e8645a96278b	6afbc2ff-af66-4e8b-90de-1c96dbe77f86	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5478&cache_key="5478_1759473933"&type="unit"&size="xl"	5478	Ảnh mẫu 30	30	2025-10-04 10:20:46.30951+07	system
3650c0e4-dd8b-44f3-ab2e-31d2f1bd60b7	7acfdac9-b3e4-4841-9ed3-031291ee79a1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5479&cache_key="5479_1759473933"&type="unit"&size="xl"	5479	Ảnh mẫu 31	31	2025-10-04 10:20:46.30951+07	system
a3ce4925-5363-433a-98e7-4a140b60d7cb	92faa1a3-d767-4152-b65f-867b983e1cb7	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5480&cache_key="5480_1759473933"&type="unit"&size="xl"	5480	Ảnh mẫu 32	32	2025-10-04 10:20:46.30951+07	system
6cd3492a-7594-4f6c-9f38-e33e4115abb3	f1476544-54ee-43e1-b954-79ef42ca73c1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5481&cache_key="5481_1759473933"&type="unit"&size="xl"	5481	Ảnh mẫu 33	33	2025-10-04 10:20:46.30951+07	system
50f07148-9b6f-4b52-ad54-526892e3c556	860ed3b7-e96f-4443-9fce-46b8bb7727bf	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5482&cache_key="5482_1759473933"&type="unit"&size="xl"	5482	Ảnh mẫu 34	34	2025-10-04 10:20:46.30951+07	system
14d19e91-e237-4e5b-98e3-18ba2cbaf2f0	f70f4c29-c2c9-447f-9301-231983449e99	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5483&cache_key="5483_1759473933"&type="unit"&size="xl"	5483	Ảnh mẫu 35	35	2025-10-04 10:20:46.30951+07	system
b6a382fc-86d5-4807-a2d8-e9e58eb32e49	da20ad0b-6975-4532-8c05-cf46132780aa	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5484&cache_key="5484_1759473933"&type="unit"&size="xl"	5484	Ảnh mẫu 36	36	2025-10-04 10:20:46.30951+07	system
86d3744e-3160-4cc4-8471-071f04418695	a9d4f4fe-5b2a-4cdd-90b2-54b456324d6c	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5485&cache_key="5485_1759473933"&type="unit"&size="xl"	5485	Ảnh mẫu 37	37	2025-10-04 10:20:46.30951+07	system
f61b398d-6fb1-440e-89d7-fbee2f555e82	e11d7c4c-9cf5-4007-bd5a-10c1ea8a8636	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5486&cache_key="5486_1759473933"&type="unit"&size="xl"	5486	Ảnh mẫu 38	38	2025-10-04 10:20:46.30951+07	system
c549f3b9-519f-4f1c-bff7-7ccd2198f552	d8791827-6c5c-4661-99b2-9fa0f51031cf	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5487&cache_key="5487_1759473933"&type="unit"&size="xl"	5487	Ảnh mẫu 39	39	2025-10-04 10:20:46.30951+07	system
ee92bb83-45a7-4a3d-bf98-a68068f3adff	6afbc2ff-af66-4e8b-90de-1c96dbe77f86	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5488&cache_key="5488_1759473933"&type="unit"&size="xl"	5488	Ảnh mẫu 40	40	2025-10-04 10:20:46.30951+07	system
48f56409-adab-472c-b44a-e6dea631eee5	7acfdac9-b3e4-4841-9ed3-031291ee79a1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5489&cache_key="5489_1759473933"&type="unit"&size="xl"	5489	Ảnh mẫu 41	41	2025-10-04 10:20:46.30951+07	system
e8884a67-6b1c-4f1f-8794-d7d055a330fd	92faa1a3-d767-4152-b65f-867b983e1cb7	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5490&cache_key="5490_1759473933"&type="unit"&size="xl"	5490	Ảnh mẫu 42	42	2025-10-04 10:20:46.30951+07	system
ee11b92f-fe50-4c22-9f8e-b45d1671f3a8	f1476544-54ee-43e1-b954-79ef42ca73c1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5491&cache_key="5491_1759473933"&type="unit"&size="xl"	5491	Ảnh mẫu 43	43	2025-10-04 10:20:46.30951+07	system
0a38394a-4134-4781-9264-1ab938bf6493	860ed3b7-e96f-4443-9fce-46b8bb7727bf	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5492&cache_key="5492_1759473933"&type="unit"&size="xl"	5492	Ảnh mẫu 44	44	2025-10-04 10:20:46.30951+07	system
3a959b20-da1c-404f-a9e2-53f66ccc0fe0	f70f4c29-c2c9-447f-9301-231983449e99	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5493&cache_key="5493_1759473933"&type="unit"&size="xl"	5493	Ảnh mẫu 45	45	2025-10-04 10:20:46.30951+07	system
e1a5a4d9-d073-46e1-875d-6f46803e447d	da20ad0b-6975-4532-8c05-cf46132780aa	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5494&cache_key="5494_1759473933"&type="unit"&size="xl"	5494	Ảnh mẫu 46	46	2025-10-04 10:20:46.30951+07	system
b4249b58-f761-491b-8c2c-271643ca8cbd	a9d4f4fe-5b2a-4cdd-90b2-54b456324d6c	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5495&cache_key="5495_1759473933"&type="unit"&size="xl"	5495	Ảnh mẫu 47	47	2025-10-04 10:20:46.30951+07	system
b503e238-e907-4ffe-a464-c05fb228e322	e11d7c4c-9cf5-4007-bd5a-10c1ea8a8636	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5496&cache_key="5496_1759473933"&type="unit"&size="xl"	5496	Ảnh mẫu 48	48	2025-10-04 10:20:46.30951+07	system
f61ef3f1-bb1e-4af6-b2ff-9705730901e6	d8791827-6c5c-4661-99b2-9fa0f51031cf	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5497&cache_key="5497_1759473933"&type="unit"&size="xl"	5497	Ảnh mẫu 49	49	2025-10-04 10:20:46.30951+07	system
f073bbc6-5b95-461b-8dc1-c9c3c54fd82a	6afbc2ff-af66-4e8b-90de-1c96dbe77f86	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5498&cache_key="5498_1759473933"&type="unit"&size="xl"	5498	Ảnh mẫu 50	50	2025-10-04 10:20:46.30951+07	system
\.


--
-- Data for Name: albums; Type: TABLE DATA; Schema: public; Owner: ninh
--

COPY public.albums (id, name, description, cover_image_url, cover_image_id, category, tags, created_at, updated_at, created_by, is_active, image_count) FROM stdin;
7acfdac9-b3e4-4841-9ed3-031291ee79a1	Vải Lụa Cao Cấp 2024	Bộ sưu tập vải lụa cao cấp nhập khẩu	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5448&cache_key="5448_1759473933"&type="unit"&size="xl"	5448	fabric	{lụa,"cao cấp",2024}	2025-10-04 10:20:46.308906+07	2025-10-04 10:20:46.30951+07	system	t	5
92faa1a3-d767-4152-b65f-867b983e1cb7	Vải Cotton Organic	Vải cotton hữu cơ thân thiện môi trường	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5449&cache_key="5449_1759473933"&type="unit"&size="xl"	5449	fabric	{cotton,organic,eco}	2025-10-04 10:20:46.308906+07	2025-10-04 10:20:46.30951+07	system	t	5
f1476544-54ee-43e1-b954-79ef42ca73c1	Vải Nhung Sang Trọng	Bộ sưu tập vải nhung cao cấp	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5450&cache_key="5450_1759473933"&type="unit"&size="xl"	5450	fabric	{nhung,"sang trọng"}	2025-10-04 10:20:46.308906+07	2025-10-04 10:20:46.30951+07	system	t	5
860ed3b7-e96f-4443-9fce-46b8bb7727bf	Biệt Thự Vinhomes	Ảnh thi công biệt thự Vinhomes Grand Park	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5451&cache_key="5451_1759473933"&type="unit"&size="xl"	5451	project	{"biệt thự",vinhomes,"cao cấp"}	2025-10-04 10:20:46.308906+07	2025-10-04 10:20:46.30951+07	system	t	5
f70f4c29-c2c9-447f-9301-231983449e99	Căn Hộ Masteri	Ảnh thi công căn hộ Masteri Thảo Điền	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5452&cache_key="5452_1759473933"&type="unit"&size="xl"	5452	project	{"căn hộ",masteri,"hiện đại"}	2025-10-04 10:20:46.308906+07	2025-10-04 10:20:46.30951+07	system	t	5
da20ad0b-6975-4532-8c05-cf46132780aa	Văn Phòng Bitexco	Ảnh thi công văn phòng tại Bitexco Tower	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5453&cache_key="5453_1759473933"&type="unit"&size="xl"	5453	project	{"văn phòng",bitexco,"thương mại"}	2025-10-04 10:20:46.308906+07	2025-10-04 10:20:46.30951+07	system	t	5
a9d4f4fe-5b2a-4cdd-90b2-54b456324d6c	Team Building 2024	Ảnh sự kiện team building công ty	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5454&cache_key="5454_1759473933"&type="unit"&size="xl"	5454	event	{"team building",2024,"nội bộ"}	2025-10-04 10:20:46.308906+07	2025-10-04 10:20:46.30951+07	system	t	5
e11d7c4c-9cf5-4007-bd5a-10c1ea8a8636	Tiệc Tất Niên 2023	Ảnh tiệc tất niên cuối năm 2023	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5455&cache_key="5455_1759473933"&type="unit"&size="xl"	5455	event	{tiệc,"tất niên",2023}	2025-10-04 10:20:46.308906+07	2025-10-04 10:20:46.30951+07	system	t	5
d8791827-6c5c-4661-99b2-9fa0f51031cf	Đào Tạo Nội Bộ Q1/2024	Ảnh khóa đào tạo nội bộ quý 1	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5456&cache_key="5456_1759473933"&type="unit"&size="xl"	5456	event	{"đào tạo","nội bộ",2024}	2025-10-04 10:20:46.308906+07	2025-10-04 10:20:46.30951+07	system	t	5
6afbc2ff-af66-4e8b-90de-1c96dbe77f86	Khai Trương Showroom	Ảnh lễ khai trương showroom mới	http://222.252.23.248:6868/synofoto/api/v2/t/Thumbnail/get?id=5457&cache_key="5457_1759473933"&type="unit"&size="xl"	5457	event	{"khai trương",showroom,"sự kiện"}	2025-10-04 10:20:46.308906+07	2025-10-04 10:20:46.30951+07	system	t	5
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: ninh
--

COPY public.employees (id, name, "position") FROM stdin;
1	Alice	Software Engineer
2	Bob	Project Manager
\.


--
-- Data for Name: event_images; Type: TABLE DATA; Schema: public; Owner: ninh
--

COPY public.event_images (id, event_id, image_id, image_url, image_name, thumbnail_url, sort_order, caption, added_at, added_by) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: ninh
--

COPY public.events (id, name, description, event_type, event_date, location, organizer, attendees_count, cover_image_url, cover_image_id, image_count, created_at, updated_at, created_by, is_active, tags, status) FROM stdin;
199396b2-e015-42a4-a6ed-c7cba7e118f4	Tiệc Tất Niên 2024	Tiệc tất niên công ty chào đón năm mới	company_party	2024-12-20	Khách sạn Metropole Hà Nội	Phòng Hành Chính	150	https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop	\N	0	2025-10-03 15:47:45.703066+07	2025-10-03 15:47:45.704191+07	system	t	{celebration,year-end,party}	completed
9efa9f7e-6c22-49ce-9f33-808ac75b863b	Team Building Q1 2025	Hoạt động team building quý 1	team_building	2025-03-15	Sapa, Lào Cai	Phòng Nhân Sự	80	https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop	\N	0	2025-10-03 15:47:45.703066+07	2025-10-03 15:47:45.704594+07	system	t	{teamwork,outdoor,bonding}	completed
ced61ae3-0e7b-4f00-b9ad-41379bb64214	Đào Tạo Kỹ Năng Bán Hàng	Khóa đào tạo kỹ năng bán hàng cho đội Sales	training	2025-04-10	Văn phòng HN	Phòng Đào Tạo	30	https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop	\N	0	2025-10-03 15:47:45.703066+07	2025-10-03 15:47:45.704829+07	system	t	{training,sales,skills}	completed
a991c157-2352-46fb-b4ac-d34190ddba56	Hội Nghị Khách Hàng 2025	Hội nghị thường niên với khách hàng VIP	conference	2025-05-20	JW Marriott Hanoi	Phòng Marketing	200	https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop	\N	0	2025-10-03 15:47:45.703066+07	2025-10-03 15:47:45.705049+07	system	t	{conference,clients,networking}	upcoming
2ddcb8f5-c240-44b7-95c8-caea42f4d910	Lễ Trao Giải Nhân Viên Xuất Sắc	Vinh danh nhân viên xuất sắc Q1	award_ceremony	2025-04-30	Văn phòng HN	Ban Giám Đốc	100	https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop	\N	0	2025-10-03 15:47:45.703066+07	2025-10-03 15:47:45.705215+07	system	t	{awards,recognition,motivation}	upcoming
a882b9b0-a883-4880-8a2c-1faa3e108a51	Kỷ Niệm 10 Năm Thành Lập	Lễ kỷ niệm 10 năm thành lập công ty	anniversary	2025-06-15	Trung tâm Hội nghị Quốc gia	Ban Tổ Chức	300	https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop	\N	0	2025-10-03 15:47:45.703066+07	2025-10-03 15:47:45.705382+07	system	t	{anniversary,milestone,celebration}	upcoming
37f5a7b8-d9e6-4ccb-943c-4bc1ae756dd7	Workshop Thiết Kế Nội Thất	Workshop về xu hướng thiết kế nội thất 2025	training	2025-03-25	Văn phòng HCM	Phòng Thiết Kế	40	https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop	\N	0	2025-10-03 15:47:45.703066+07	2025-10-03 15:47:45.705573+07	system	t	{workshop,design,trends}	completed
7dc10f95-cc9a-40a3-aa10-1adeddf9fe8c	Picnic Gia Đình	Ngày hội gia đình công ty	company_party	2025-05-01	Công viên Thủ Lệ	Phòng Nhân Sự	250	https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop	\N	0	2025-10-03 15:47:45.703066+07	2025-10-03 15:47:45.705807+07	system	t	{family,outdoor,fun}	upcoming
1c101651-bf98-49b1-919b-b74e6086a2ee	Hội Thảo Công Nghệ AI	Hội thảo về ứng dụng AI trong kinh doanh	conference	2025-04-15	Văn phòng HN	Phòng IT	60	https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop	\N	0	2025-10-03 15:47:45.703066+07	2025-10-03 15:47:45.706042+07	system	t	{technology,AI,innovation}	upcoming
90f19014-c60e-43aa-8960-d02a637caaa8	Sinh Nhật Công Ty Tháng 3	Tiệc sinh nhật tập thể tháng 3	company_party	2025-03-28	Văn phòng HN	Phòng Hành Chính	50	https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop	\N	0	2025-10-03 15:47:45.703066+07	2025-10-03 15:47:45.706195+07	system	t	{birthday,celebration,monthly}	completed
\.


--
-- Data for Name: project_fabrics; Type: TABLE DATA; Schema: public; Owner: ninh
--

COPY public.project_fabrics (id, project_id, fabric_id, fabric_code, fabric_name, quantity, room_type, notes, added_at, added_by) FROM stdin;
d42aefc1-cbcc-4549-98be-95086e8885de	5f35f7b5-7a38-4fc8-8250-6be913f4ae90	\N	F001	Vải Lụa Cao Cấp	15.50	Phòng khách	Vải lụa mềm mại, sang trọng	2025-10-04 09:19:11.408974+07	system
dfb41081-7654-4550-8d44-5e4578d20ac0	5f35f7b5-7a38-4fc8-8250-6be913f4ae90	\N	F002	Vải Cotton Organic	20.00	Phòng ngủ	Vải cotton tự nhiên, thân thiện môi trường	2025-10-04 09:19:11.412621+07	system
17ff40bf-9711-4325-a4c8-039a19e79fd7	6aa7e279-482a-4361-a2fc-772b18ea2117	\N	F003	Vải Nhung Cao Cấp	30.00	Phòng khách	Vải nhung sang trọng cho biệt thự	2025-10-04 09:19:11.413097+07	system
3a1a3e61-e8ea-4bc4-8958-9df2d83d5618	6aa7e279-482a-4361-a2fc-772b18ea2117	\N	F004	Vải Linen Cao Cấp	25.00	Phòng ngủ chính	Vải linen thoáng mát, cao cấp	2025-10-04 09:19:11.413336+07	system
\.


--
-- Data for Name: project_images; Type: TABLE DATA; Schema: public; Owner: ninh
--

COPY public.project_images (id, project_id, image_id, image_url, image_name, thumbnail_url, sort_order, caption, room_type, added_at, added_by) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: ninh
--

COPY public.projects (id, name, description, project_type, location, client_name, completion_date, cover_image_url, cover_image_id, image_count, created_at, updated_at, created_by, is_active, tags, status) FROM stdin;
5f35f7b5-7a38-4fc8-8250-6be913f4ae90	Modern Residence	Biệt thự hiện đại với thiết kế tối giản	residential	Hà Nội	\N	\N	https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop	\N	0	2025-10-03 15:41:44.943606+07	2025-10-03 15:42:40.575466+07	system	t	{modern,minimalist,villa}	completed
cf87e2a4-b308-4987-a35f-6c441c34a6da	Urban Office Space	Không gian văn phòng đô thị	office	TP.HCM	\N	\N	https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop	\N	0	2025-10-03 15:41:44.943606+07	2025-10-03 15:42:40.585315+07	system	t	{office,urban,workspace}	completed
06a2b0c6-def8-4500-ab22-093bb7c86301	Retail Store Design	Thiết kế cửa hàng bán lẻ	retail	Đà Nẵng	\N	\N	https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop	\N	0	2025-10-03 15:41:44.943606+07	2025-10-03 15:42:40.585845+07	system	t	{retail,store,commercial}	completed
aaf73d67-083f-4167-bae7-cbc260d8a624	Renovated Apartment	Căn hộ cải tạo hiện đại	residential	Hà Nội	\N	\N	https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop	\N	0	2025-10-03 15:41:44.943606+07	2025-10-03 15:42:40.586239+07	system	t	{apartment,renovation,modern}	completed
6aa7e279-482a-4361-a2fc-772b18ea2117	Luxury Villa	Biệt thự cao cấp	residential	Nha Trang	\N	\N	https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop	\N	0	2025-10-03 15:41:44.943606+07	2025-10-03 15:42:40.586608+07	system	t	{luxury,villa,resort}	completed
d7c3b35e-225e-4101-8e5b-07cb02051cd7	Co-working Space	Không gian làm việc chung	office	TP.HCM	\N	\N	https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop	\N	0	2025-10-03 15:41:44.943606+07	2025-10-03 15:42:40.587048+07	system	t	{coworking,shared,modern}	completed
a8064f5c-a630-4548-9449-5a1d6be14f01	Restaurant Interior	Nội thất nhà hàng	hospitality	Hội An	\N	\N	https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop	\N	0	2025-10-03 15:41:44.943606+07	2025-10-03 15:42:40.58739+07	system	t	{restaurant,hospitality,interior}	completed
6e99e20b-8e4f-49fd-9c1b-9efba51f24d6	Boutique Hotel	Khách sạn boutique	hospitality	Đà Lạt	\N	\N	https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop	\N	0	2025-10-03 15:41:44.943606+07	2025-10-03 15:42:40.587813+07	system	t	{hotel,boutique,luxury}	completed
\.


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ninh
--

SELECT pg_catalog.setval('public.employees_id_seq', 2, true);


--
-- Name: album_images album_images_pkey; Type: CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.album_images
    ADD CONSTRAINT album_images_pkey PRIMARY KEY (id);


--
-- Name: albums albums_pkey; Type: CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: event_images event_images_pkey; Type: CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT event_images_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: project_fabrics project_fabrics_pkey; Type: CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.project_fabrics
    ADD CONSTRAINT project_fabrics_pkey PRIMARY KEY (id);


--
-- Name: project_images project_images_pkey; Type: CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.project_images
    ADD CONSTRAINT project_images_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: idx_album_images_album; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_album_images_album ON public.album_images USING btree (album_id);


--
-- Name: idx_album_images_order; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_album_images_order ON public.album_images USING btree (album_id, display_order);


--
-- Name: idx_albums_active; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_albums_active ON public.albums USING btree (is_active);


--
-- Name: idx_albums_category; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_albums_category ON public.albums USING btree (category);


--
-- Name: idx_albums_created_at; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_albums_created_at ON public.albums USING btree (created_at DESC);


--
-- Name: idx_event_images_event_id; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_event_images_event_id ON public.event_images USING btree (event_id);


--
-- Name: idx_event_images_sort_order; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_event_images_sort_order ON public.event_images USING btree (event_id, sort_order);


--
-- Name: idx_events_created_at; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_events_created_at ON public.events USING btree (created_at DESC);


--
-- Name: idx_events_event_date; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_events_event_date ON public.events USING btree (event_date DESC);


--
-- Name: idx_events_event_type; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_events_event_type ON public.events USING btree (event_type);


--
-- Name: idx_events_is_active; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_events_is_active ON public.events USING btree (is_active);


--
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_events_status ON public.events USING btree (status);


--
-- Name: idx_events_tags; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_events_tags ON public.events USING gin (tags);


--
-- Name: idx_project_fabrics_fabric; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_project_fabrics_fabric ON public.project_fabrics USING btree (fabric_id);


--
-- Name: idx_project_fabrics_project; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_project_fabrics_project ON public.project_fabrics USING btree (project_id);


--
-- Name: idx_project_fabrics_room; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_project_fabrics_room ON public.project_fabrics USING btree (room_type);


--
-- Name: idx_project_images_project_id; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_project_images_project_id ON public.project_images USING btree (project_id);


--
-- Name: idx_project_images_sort_order; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_project_images_sort_order ON public.project_images USING btree (project_id, sort_order);


--
-- Name: idx_projects_created_at; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_projects_created_at ON public.projects USING btree (created_at DESC);


--
-- Name: idx_projects_is_active; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_projects_is_active ON public.projects USING btree (is_active);


--
-- Name: idx_projects_project_type; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_projects_project_type ON public.projects USING btree (project_type);


--
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_projects_status ON public.projects USING btree (status);


--
-- Name: idx_projects_tags; Type: INDEX; Schema: public; Owner: ninh
--

CREATE INDEX idx_projects_tags ON public.projects USING gin (tags);


--
-- Name: album_images trigger_update_albums_image_count_delete; Type: TRIGGER; Schema: public; Owner: ninh
--

CREATE TRIGGER trigger_update_albums_image_count_delete AFTER DELETE ON public.album_images FOR EACH ROW EXECUTE FUNCTION public.update_albums_image_count();


--
-- Name: album_images trigger_update_albums_image_count_insert; Type: TRIGGER; Schema: public; Owner: ninh
--

CREATE TRIGGER trigger_update_albums_image_count_insert AFTER INSERT ON public.album_images FOR EACH ROW EXECUTE FUNCTION public.update_albums_image_count();


--
-- Name: albums trigger_update_albums_updated_at; Type: TRIGGER; Schema: public; Owner: ninh
--

CREATE TRIGGER trigger_update_albums_updated_at BEFORE UPDATE ON public.albums FOR EACH ROW EXECUTE FUNCTION public.update_albums_updated_at();


--
-- Name: event_images trigger_update_event_image_count_delete; Type: TRIGGER; Schema: public; Owner: ninh
--

CREATE TRIGGER trigger_update_event_image_count_delete AFTER DELETE ON public.event_images FOR EACH ROW EXECUTE FUNCTION public.update_event_image_count();


--
-- Name: event_images trigger_update_event_image_count_insert; Type: TRIGGER; Schema: public; Owner: ninh
--

CREATE TRIGGER trigger_update_event_image_count_insert AFTER INSERT ON public.event_images FOR EACH ROW EXECUTE FUNCTION public.update_event_image_count();


--
-- Name: events trigger_update_events_updated_at; Type: TRIGGER; Schema: public; Owner: ninh
--

CREATE TRIGGER trigger_update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_events_updated_at();


--
-- Name: project_images trigger_update_project_image_count_delete; Type: TRIGGER; Schema: public; Owner: ninh
--

CREATE TRIGGER trigger_update_project_image_count_delete AFTER DELETE ON public.project_images FOR EACH ROW EXECUTE FUNCTION public.update_project_image_count();


--
-- Name: project_images trigger_update_project_image_count_insert; Type: TRIGGER; Schema: public; Owner: ninh
--

CREATE TRIGGER trigger_update_project_image_count_insert AFTER INSERT ON public.project_images FOR EACH ROW EXECUTE FUNCTION public.update_project_image_count();


--
-- Name: projects trigger_update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: ninh
--

CREATE TRIGGER trigger_update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_projects_updated_at();


--
-- Name: album_images album_images_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.album_images
    ADD CONSTRAINT album_images_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE CASCADE;


--
-- Name: event_images event_images_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.event_images
    ADD CONSTRAINT event_images_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: project_fabrics project_fabrics_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.project_fabrics
    ADD CONSTRAINT project_fabrics_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_images project_images_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ninh
--

ALTER TABLE ONLY public.project_images
    ADD CONSTRAINT project_images_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict UHldlw6WbWR9306sjmVTx731c3en1zSKf9Ue9B5L4da6hfCxLX09Ew1uffw6uWZ

