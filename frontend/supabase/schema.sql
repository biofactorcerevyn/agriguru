-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_advisories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL,
  advisory_type text NOT NULL,
  input_parameters jsonb NOT NULL,
  ai_response jsonb NOT NULL,
  confidence_score numeric,
  language USER-DEFINED DEFAULT 'english'::supported_language,
  is_accurate boolean,
  farmer_feedback text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_advisories_pkey PRIMARY KEY (id),
  CONSTRAINT ai_advisories_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id)
);
CREATE TABLE public.community_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  tags ARRAY,
  images ARRAY,
  location_specific boolean DEFAULT false,
  district text,
  state text,
  language USER-DEFINED DEFAULT 'english'::supported_language,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_expert_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_posts_pkey PRIMARY KEY (id),
  CONSTRAINT community_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.farmer_profiles(id)
);
CREATE TABLE public.crop_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL,
  crop_name text NOT NULL,
  crop_category USER-DEFINED,
  season USER-DEFINED,
  year integer NOT NULL,
  area_cultivated numeric,
  yield_per_unit numeric,
  total_yield numeric,
  cost_of_cultivation numeric,
  selling_price numeric,
  profit_loss numeric,
  challenges_faced ARRAY,
  success_factors ARRAY,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT crop_records_pkey PRIMARY KEY (id),
  CONSTRAINT crop_records_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id)
);
CREATE TABLE public.disease_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL,
  crop_name text NOT NULL,
  image_url text NOT NULL,
  disease_identified text,
  confidence_score numeric,
  treatment_recommendations jsonb,
  prevention_measures ARRAY,
  cost_estimate numeric,
  is_verified_by_expert boolean DEFAULT false,
  expert_notes text,
  farmer_feedback text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT disease_analyses_pkey PRIMARY KEY (id),
  CONSTRAINT disease_analyses_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES public.farmer_profiles(id)
);
CREATE TABLE public.farmer_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  village text,
  district text NOT NULL,
  state text NOT NULL,
  country text DEFAULT 'India'::text,
  latitude numeric,
  longitude numeric,
  preferred_language USER-DEFINED DEFAULT 'english'::supported_language,
  experience_level USER-DEFINED DEFAULT 'beginner'::experience_level,
  farm_size_value numeric,
  farm_size_unit USER-DEFINED DEFAULT 'acres'::farm_size_unit,
  primary_soil_type USER-DEFINED,
  water_source USER-DEFINED DEFAULT 'rainfed'::water_source,
  annual_rainfall_mm integer,
  farming_objective text,
  communication_preference ARRAY DEFAULT ARRAY['app'::text],
  profile_image_url text,
  is_verified boolean DEFAULT false,
  community_points integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  preferred_crops ARRAY DEFAULT '{}'::text[],
  phone text,
  email text,
  CONSTRAINT farmer_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT farmer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.market_prices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  crop_name text NOT NULL,
  variety text,
  market_name text NOT NULL,
  district text NOT NULL,
  state text NOT NULL,
  price_per_quintal numeric,
  price_date date NOT NULL,
  quality_grade text,
  data_source text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT market_prices_pkey PRIMARY KEY (id)
);
CREATE TABLE public.post_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  author_id uuid NOT NULL,
  content text NOT NULL,
  parent_comment_id uuid,
  is_expert_response boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_posts(id),
  CONSTRAINT post_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.post_comments(id),
  CONSTRAINT post_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.farmer_profiles(id)
);
CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_posts(id),
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.farmer_profiles(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'farmer'::app_role,
  assigned_by uuid,
  assigned_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.weather_data (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  location_key text NOT NULL,
  district text NOT NULL,
  state text NOT NULL,
  latitude numeric,
  longitude numeric,
  current_weather jsonb,
  forecast_data jsonb,
  agricultural_insights jsonb,
  data_source text DEFAULT 'openweathermap'::text,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT weather_data_pkey PRIMARY KEY (id)
);