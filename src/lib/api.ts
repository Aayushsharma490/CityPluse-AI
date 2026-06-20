import axios from 'axios';
import { Complaint, ClassifyResponse, AnalyticsSummary } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://citypluse-ai-backend.onrender.com';

const client = axios.create({
  baseURL: API_URL,
});

export const classifyComplaint = async (complaintText: string, ward?: string): Promise<ClassifyResponse> => {
  const response = await client.post<ClassifyResponse>('/classify', {
    complaint_text: complaintText,
    text: complaintText,
    ward: ward || '',
  });
  return response.data;
};

export const getComplaints = async (): Promise<Complaint[]> => {
  const response = await client.get<Complaint[]>('/complaints');
  return response.data;
};

export const saveComplaint = async (complaint: Complaint): Promise<Complaint> => {
  const response = await client.post<Complaint>('/complaints', complaint);
  return response.data;
};

export const getComplaint = async (id: string): Promise<Complaint> => {
  const response = await client.get<Complaint>(`/complaints/${id}`);
  return response.data;
};

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const response = await client.get<AnalyticsSummary>('/analytics/summary');
  return response.data;
};

export const updateComplaint = async (id: string, status?: string, department?: string): Promise<Complaint> => {
  const response = await client.patch<Complaint>(`/complaints/${id}`, { status, department });
  return response.data;
};

export interface PredictiveData {
  predictions: Record<string, number>;
  ward_risk_scores: Record<string, number>;
  proactive_suggestions: string[];
}

export const getPredictiveAnalytics = async (): Promise<PredictiveData> => {
  const response = await client.get<PredictiveData>('/analytics/predictive');
  return response.data;
};

export interface AssistantResponse {
  reply: string;
  action: string | null;
  action_data: any | null;
}

export const chatWithAssistant = async (text: string, language: string): Promise<AssistantResponse> => {
  const response = await client.post<AssistantResponse>('/assistant/chat', { text, language });
  return response.data;
};

