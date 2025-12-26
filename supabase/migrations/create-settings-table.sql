-- Create settings table for environment variables management
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read settings
CREATE POLICY "Authenticated users can read settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can insert/update settings
CREATE POLICY "Authenticated users can manage settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Insert default settings if they don't exist
INSERT INTO settings (key, value, description, category)
VALUES
  ('AI_GATEWAY_API_KEY', '', 'Chave API do Vercel AI Gateway para acesso a múltiplos modelos de IA', 'ai'),
  ('GEMINI_API_KEY', '', 'Chave API do Google Gemini (opcional, pode usar BYOK no AI Gateway)', 'ai'),
  ('ANTHROPIC_API_KEY', '', 'Chave API da Anthropic Claude (opcional, para BYOK no AI Gateway)', 'ai'),
  ('OPENAI_API_KEY', '', 'Chave API da OpenAI (opcional, para BYOK no AI Gateway)', 'ai')
ON CONFLICT (key) DO NOTHING;

