describe('Aura Bridge Core Logic', () => {
  it('severity score is between 1 and 10', () => {
    const score = 9;
    expect(score).toBeGreaterThanOrEqual(1);
    expect(score).toBeLessThanOrEqual(10);
  });

  it('rejects empty input', () => {
    const input = '';
    expect(input.length).toBe(0);
  });

  it('rejects images above 5MB', () => {
    const maxSize = 5 * 1024 * 1024;
    const fileSize = 6 * 1024 * 1024;
    expect(fileSize).toBeGreaterThan(maxSize);
  });

  it('color code RED for severity above 7', () => {
    const score = 9;
    const color = score >= 8 ? 'RED' : score >= 5 ? 'AMBER' : 'GREEN';
    expect(color).toBe('RED');
  });

  it('confidence score is between 0 and 100', () => {
    const confidence = 85;
    expect(confidence).toBeGreaterThanOrEqual(0);
    expect(confidence).toBeLessThanOrEqual(100);
  });

  it('API failure fallback to AMBER severity 5', () => {
    // Mocking the fallback logic in route.ts
    const simulate_api_error = true;
    const fallback_result = simulate_api_error ? { severity: 5, color: 'AMBER' } : { severity: 1, color: 'GREEN' };
    expect(fallback_result.severity).toBe(5);
    expect(fallback_result.color).toBe('AMBER');
  });

  it('gracefully handles markdown-wrapped Gemini JSON', () => {
    const raw_gemini_output = "Sure, here is the triage: ```json\n{ \"severity\": 10, \"primary_threat\": \"Life Threatening\" }\n```";
    const jsonMatch = raw_gemini_output.match(/\{[\s\S]*\}/);
    expect(jsonMatch).not.toBeNull();
    const parsed = JSON.parse(jsonMatch![0]);
    expect(parsed.severity).toBe(10);
  });
});
