export function buildPrompt(resumeText: string, jobDescription: string): string {
  return `Você é um especialista em recrutamento e otimização de currículos para sistemas ATS (Applicant Tracking System).

Analise o CURRÍCULO ORIGINAL e a DESCRIÇÃO DA VAGA fornecidos abaixo.

Reestruture o currículo para maximizar compatibilidade com sistemas ATS e aumentar a relevância para a vaga específica.

## REGRAS OBRIGATÓRIAS
1. Preserve APENAS informações presentes no currículo original — NÃO invente experiências, certificações, competências ou qualificações.
2. Destaque palavras-chave relevantes da descrição da vaga de forma natural e profissional nas descrições de experiência e habilidades.
3. Reorganize as seções para priorizar o que é mais relevante para a vaga.
4. Use linguagem profissional e clara.
5. Mantenha o formato limpo e otimizado para leitura por ATS (sem tabelas, colunas ou formatação complexa).
6. Se o currículo original não contiver informações para alguma seção, omita-a.

## ESTRUTURA DE SAÍDA (use markdown)

# Nome Completo
Email | Telefone | LinkedIn | GitHub (se disponíveis)

### Resumo Profissional
2-3 linhas destacando experiência alinhada com a vaga.

### Experiência Profissional

**Cargo** | Empresa | Período
- Realização ou responsabilidade com palavras-chave da vaga incorporadas naturalmente.
- Próxima realização...
(repita para cada cargo, do mais recente ao mais antigo)

### Formação Acadêmica

**Curso** | Instituição | Período

### Habilidades Técnicas
- **Categoria 1:** habilidade 1, habilidade 2, habilidade 3
- **Categoria 2:** habilidade 1, habilidade 2
(organize por categorias relevantes à vaga)

### Idiomas
- Idioma | Nível

### Certificações (se houver)
- Certificação | Instituição | Ano

---
CURRÍCULO ORIGINAL:
${resumeText}

---
DESCRIÇÃO DA VAGA:
${jobDescription}

---
Gere APENAS o currículo otimizado, sem comentários adicionais.`
}
