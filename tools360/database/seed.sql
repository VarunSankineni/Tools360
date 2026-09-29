-- Optional sample rows for local testing only. Do not run on your live database.
INSERT INTO tool_usage (tool, used_on, count) VALUES
  ('merge-pdf', CURRENT_DATE, 12),
  ('image-compressor', CURRENT_DATE, 9),
  ('png-to-jpg', CURRENT_DATE, 7)
ON CONFLICT DO NOTHING;
INSERT INTO feedback (tool, helpful) VALUES ('merge-pdf', true), ('png-to-jpg', true), ('image-compressor', false);
