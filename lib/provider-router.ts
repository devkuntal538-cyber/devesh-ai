export type TaskMode = 'auto' | 'fast' | 'reasoning' | 'coding' | 'research' | 'creative' | 'vision';

export function chooseModelForTask(task: string, availableModels: any[], preferredMode: TaskMode = 'auto') {
  const text = task.toLowerCase();
  const mode = preferredMode === 'auto' ? classifyTask(text) : preferredMode;

  const filtered = [...availableModels].filter((model) => {
    if (!model?.id) return false;
    if (mode === 'coding') return model.category === 'Coding AI' || model.capabilities.includes('coding');
    if (mode === 'research') return model.category === 'Research/Search AI' || model.supportsWebSearch;
    if (mode === 'reasoning') return model.category === 'Reasoning AI' || model.capabilities.includes('reasoning');
    if (mode === 'vision') return model.supportsVision;
    if (mode === 'creative') return model.provider !== 'Perplexity';
    if (mode === 'fast') return model.category !== 'Reasoning AI';
    return true;
  });

  if (filtered.length === 0) return availableModels[0] ?? null;

  const priority = [
    'gpt-4o',
    'claude-3-5-sonnet',
    'gemini-1.5-pro',
    'deepseek-reasoner',
    'perplexity-sonar',
    'qwen-coder',
    'gpt-4o-mini',
    'gemini-2.0-flash',
  ];

  return filtered.sort((left, right) => {
    const leftIndex = priority.indexOf(left.id);
    const rightIndex = priority.indexOf(right.id);
    if (leftIndex === -1 && rightIndex === -1) return 0;
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  })[0];
}

function classifyTask(text: string): TaskMode {
  if (/code|bug|debug|build|react|typescript|api|function|component|fix/.test(text)) return 'coding';
  if (/research|search|news|latest|compare|find|summarize.*source|paper/.test(text)) return 'research';
  if (/math|logic|analyze|reason|proof|strategy|plan/.test(text)) return 'reasoning';
  if (/image|diagram|screenshot|chart|document|vision|read this/.test(text)) return 'vision';
  if (/creative|story|poem|brand|marketing|write|email|script/.test(text)) return 'creative';
  return 'fast';
}
