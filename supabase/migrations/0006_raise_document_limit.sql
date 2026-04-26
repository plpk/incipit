-- Raise the early access document cap from 5 to 10.
--
-- Migration 0004 set the column default to 5. PR #31 changed that default to
-- 10, but defaults only apply on insert — existing profile rows kept their
-- stored value of 5, so the sidebar in production still shows "X of 5".
--
-- This migration bumps every row still on the old default of 5. Rows that
-- have been manually set higher (e.g. internal testers) are left alone.

update profiles
set document_limit = 10
where document_limit = 5;
