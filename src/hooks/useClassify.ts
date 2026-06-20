import { useState } from 'react';
import * as api from '../lib/api';
import { ClassifyResponse } from '../types';

export type ClassifyState = 'idle' | 'loading' | 'success' | 'error';

export const useClassify = () => {
  const [state, setState] = useState<ClassifyState>('idle');
  const [result, setResult] = useState<ClassifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const classify = async (text: string, ward?: string) => {
    setState('loading');
    setError(null);
    try {
      const response = await api.classifyComplaint(text, ward);
      setResult(response);
      setState('success');
      return response;
    } catch (err: any) {
      console.error("Classification error:", err);
      const errMsg = err?.response?.data?.detail || "AI Classification Service timed out. Please retry or verify backend connection.";
      setError(errMsg);
      setState('error');
      throw err;
    }
  };

  const reset = () => {
    setState('idle');
    setResult(null);
    setError(null);
  };

  return { state, result, error, classify, reset };
};
export default useClassify;
