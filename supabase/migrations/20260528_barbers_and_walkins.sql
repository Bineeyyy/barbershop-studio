-- ============================================================================
-- Barbers + Walk-ins
-- ----------------------------------------------------------------------------
-- Adds barber_id / barber_name / walk_in to bookings, replaces slot
-- uniqueness so multiple barbers can be booked in the same time slot, and
-- updates the get_taken_slots RPC to return barber_id.
--
-- Safe to re-run: all ALTER/CREATE use IF NOT EXISTS / OR REPLACE.
-- ============================================================================

-- 1) New columns ---------------------------------------------------------------
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS barber_id   INTEGER;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS barber_name TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS walk_in     BOOLEAN NOT NULL DEFAULT FALSE;

-- 2) Drop old slot-level UNIQUE constraints (we replace with per-barber index)
DO $$
DECLARE c RECORD;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.bookings'::regclass AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE public.bookings DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

DROP INDEX IF EXISTS public.bookings_per_barber_slot;

-- 3) Per-barber-per-slot uniqueness.
--    COALESCE(barber_id, 0) → shops without barbers still get 1 booking/slot.
CREATE UNIQUE INDEX bookings_per_barber_slot
  ON public.bookings (shop_slug, date, slot_time, COALESCE(barber_id, 0));

-- 4) Update RPC to include barber_id in result.
DROP FUNCTION IF EXISTS public.get_taken_slots(text, date);
CREATE FUNCTION public.get_taken_slots(p_shop_slug text, p_date date)
RETURNS TABLE(slot_time text, duration_min integer, barber_id integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT b.slot_time::text, b.duration_min, b.barber_id
  FROM public.bookings b
  WHERE b.shop_slug = p_shop_slug AND b.date = p_date;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_taken_slots(text, date) TO anon, authenticated;
