export type SupportedLanguage = 'go' | 'java' | 'python' | 'typescript';

export interface CodeSnippet {
  language: SupportedLanguage;
  label: string;
  code: string;
}
