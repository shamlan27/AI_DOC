"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Doctor } from '../types';
import { doctorService, RecommendationRequestContext, TriageQuestion } from '../services/doctorService';

type ChatRole = 'assistant' | 'user';

const INITIAL_CHAT_TIMESTAMP = '2026-04-06T00:00:00.000Z';
const INITIAL_CHAT_MESSAGE_ID = 'initial-assistant-message';

interface ChatMessage {
    id: string;
    role: ChatRole;
    text: string;
    createdAt: string;
    doctors?: Doctor[];
    matchedSpecialties?: Array<{
        specialty: string;
        confidence: number;
    }>;
    urgencyLevel?: string;
    emergencyAdvice?: string;
}

export default function SymptomInput() {
    const [composerText, setComposerText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: INITIAL_CHAT_MESSAGE_ID,
            role: 'assistant',
            text: 'Hello. Describe your symptoms and I will guide you step-by-step before recommending a doctor.',
            createdAt: INITIAL_CHAT_TIMESTAMP,
        },
    ]);
    const [triageQuestions, setTriageQuestions] = useState<TriageQuestion[]>([]);
    const [triageAnswers, setTriageAnswers] = useState<Record<string, string>>({});
    const [activeSymptoms, setActiveSymptoms] = useState<string | null>(null);
    const messageListRef = useRef<HTMLDivElement | null>(null);

    // Import AppointmentModal if needed or handle booking via parent
    // For this refactor, we are focusing on the Analysis -> Recommendation flow.
    // Ideally, the Appointment logic should be lifted up or handled by a context/provider, 
    // but we will simply log the booking action for now or redirect.
    const router = useRouter();

    useEffect(() => {
        if (!messageListRef.current) {
            return;
        }

        const container = messageListRef.current;
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages, isAnalyzing]);

    const formatMessageTime = (iso: string): string => {
        const parsed = new Date(iso);
        if (isNaN(parsed.getTime())) {
            return '';
        }

        return parsed.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: 'UTC',
        });
    };

    const hasGreetingOnly = (value: string): boolean => {
        const normalized = value.toLowerCase().trim();
        const greetingPatterns = [
            'hi',
            'hello',
            'hey',
            'how are you',
            'good morning',
            'good afternoon',
            'good evening',
            'thanks',
        ];

        return greetingPatterns.some((pattern) => normalized === pattern || normalized.includes(pattern));
    };

    const isHealthRelated = (value: string): boolean => {
        const keywordPattern = /\b(pain|fever|cough|cold|headache|migraine|dizzy|dizziness|vomit|nausea|stomach|chest|breath|breathing|rash|allergy|sore|throat|fatigue|weak|diabetes|pressure|infection|injury|bleeding|swelling|anxiety|depression|sleep|burn|fracture|symptom)\b/i;
        return keywordPattern.test(value);
    };

    const appendAssistantMessage = (message: Omit<ChatMessage, 'id' | 'role'>) => {
        setMessages((previous) => [
            ...previous,
            {
                id: crypto.randomUUID(),
                role: 'assistant',
                createdAt: new Date().toISOString(),
                ...message,
            },
        ]);
    };

    const appendUserMessage = (text: string) => {
        setMessages((previous) => [
            ...previous,
            {
                id: crypto.randomUUID(),
                role: 'user',
                text,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    const clearConversation = () => {
        setComposerText('');
        setIsAnalyzing(false);
        setTriageQuestions([]);
        setTriageAnswers({});
        setActiveSymptoms(null);
        setMessages([
            {
                id: INITIAL_CHAT_MESSAGE_ID,
                role: 'assistant',
                text: 'New chat started. Please describe your current symptoms.',
                createdAt: INITIAL_CHAT_TIMESTAMP,
            },
        ]);
    };

    const sendForRecommendation = async (symptoms: string, context: RecommendationRequestContext = {}) => {
        const recommendation = await doctorService.getRecommendedDoctors(symptoms, 3, context);

        if (recommendation.follow_up_required) {
            const questions = recommendation.follow_up_questions ?? [];
            setTriageQuestions(questions);

            appendAssistantMessage({
                text: 'I need a few follow-up details before recommending a doctor.',
                urgencyLevel: recommendation.urgency_level,
                emergencyAdvice: recommendation.emergency_advice ?? undefined,
            });

            if (questions.length > 0) {
                appendAssistantMessage({
                    text: questions[0].question,
                });
            }

            return;
        }

        const specialtiesText = (recommendation.matched_specialties ?? [])
            .slice(0, 3)
            .map((item) => `${item.specialty} (${Math.round(item.confidence * 100)}%)`)
            .join(', ');

        appendAssistantMessage({
            text: recommendation.doctors.length > 0
                ? `Here are the recommended doctors. Top matched specialties: ${specialtiesText || 'not available'}.`
                : 'I could not find a confident doctor match from your symptoms. Please add more detail.',
            doctors: recommendation.doctors,
            matchedSpecialties: recommendation.matched_specialties,
            urgencyLevel: recommendation.urgency_level,
            emergencyAdvice: recommendation.emergency_advice ?? undefined,
        });

        setTriageQuestions([]);
        setTriageAnswers({});
    };

    const handleSend = async () => {
        const userText = composerText.trim();
        if (!userText) {
            return;
        }

        appendUserMessage(userText);
        setComposerText('');

        setIsAnalyzing(true);
        try {
            if (!activeSymptoms) {
                if (hasGreetingOnly(userText) || !isHealthRelated(userText)) {
                    appendAssistantMessage({
                        text: 'Please provide health-related symptoms only. Example: chest pain, fever, headache, dizziness, cough.',
                    });
                    return;
                }

                setActiveSymptoms(userText);
                await sendForRecommendation(userText);
                return;
            }

            if (triageQuestions.length > 0) {
                const currentQuestion = triageQuestions[0];
                const updatedAnswers = {
                    ...triageAnswers,
                    [currentQuestion.id]: userText,
                };
                setTriageAnswers(updatedAnswers);

                const remainingQuestions = triageQuestions.slice(1);
                setTriageQuestions(remainingQuestions);

                if (remainingQuestions.length > 0) {
                    appendAssistantMessage({
                        text: remainingQuestions[0].question,
                    });
                    return;
                }

                const context: RecommendationRequestContext = {};
                if (updatedAnswers.duration_days && !isNaN(Number(updatedAnswers.duration_days))) {
                    context.duration_days = Number(updatedAnswers.duration_days);
                }
                if (updatedAnswers.associated_symptoms?.trim()) {
                    context.associated_symptoms = updatedAnswers.associated_symptoms.trim();
                }
                if (updatedAnswers.meal_relation?.trim()) {
                    context.meal_relation = updatedAnswers.meal_relation.trim();
                }

                await sendForRecommendation(activeSymptoms, context);
                return;
            }

            if (hasGreetingOnly(userText) || !isHealthRelated(userText)) {
                appendAssistantMessage({
                    text: 'If you want a new analysis, please describe symptoms in medical terms.',
                });
                return;
            }

            setActiveSymptoms(userText);
            setTriageAnswers({});
            setTriageQuestions([]);
            await sendForRecommendation(userText);
        } catch (error: unknown) {
            console.error('Failed to fetch recommendations:', error);
            const backendMessage =
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof (error as { response?: unknown }).response === 'object' &&
                (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : null;
            appendAssistantMessage({
                text: backendMessage || 'I could not complete analysis now. Please try again with detailed symptoms.',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleBook = (doctor: Doctor) => {
        router.push(`/recommendations/book/${doctor.id}`);
    };

    const urgencyStyle = useMemo(
        () =>
            ({
                emergency: 'border-red-500/40 bg-red-500/10 text-red-200',
                high: 'border-orange-500/40 bg-orange-500/10 text-orange-200',
                moderate: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200',
                low: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
            } as Record<string, string>),
        []
    );

    return (
        <div className="w-full max-w-4xl mx-auto relative z-20">
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 bg-black/30 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-white">AI Health Triage Chat</h2>
                        <p className="text-xs text-gray-400 mt-1">Conversation-style symptom analysis using your existing AI model.</p>
                    </div>
                    <button
                        onClick={clearConversation}
                        className="px-3 py-2 text-xs rounded-lg bg-white/10 text-gray-200 hover:bg-white/20 transition"
                    >
                        New Chat
                    </button>
                </div>

                <div ref={messageListRef} className="h-[32rem] overflow-y-auto p-4 md:p-5 space-y-4 bg-[#050A1A]">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-[11px] font-bold text-white flex items-center justify-center shrink-0">
                                    AI
                                </div>
                            )}

                            <div
                                className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-4 py-3 border ${
                                    message.role === 'user'
                                        ? 'bg-blue-600/20 border-blue-400/30 text-blue-100'
                                        : 'bg-white/5 border-white/10 text-gray-100'
                                }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                <p className="mt-2 text-[10px] text-gray-400">{formatMessageTime(message.createdAt)}</p>

                                {message.urgencyLevel && message.emergencyAdvice && (
                                    <div
                                        className={`mt-3 rounded-lg px-3 py-2 text-xs border ${urgencyStyle[message.urgencyLevel] ?? urgencyStyle.low}`}
                                    >
                                        <p className="font-semibold uppercase tracking-wide">Urgency: {message.urgencyLevel}</p>
                                        <p className="mt-1">{message.emergencyAdvice}</p>
                                    </div>
                                )}

                                {message.doctors && message.doctors.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {message.doctors.map((doctor) => (
                                            <div key={`${message.id}-${doctor.id}`} className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-white">{doctor.name}</p>
                                                    <p className="text-xs text-blue-300">{doctor.specialty}</p>
                                                    <p className="text-[11px] text-gray-400 mt-1">{doctor.availability ?? 'Availability not provided'}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleBook(doctor)}
                                                    className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                                                >
                                                    Book
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {message.role === 'user' && (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-[11px] font-bold text-white flex items-center justify-center shrink-0">
                                    You
                                </div>
                            )}
                        </div>
                    ))}

                    {isAnalyzing && (
                        <div className="flex justify-start items-end gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-[11px] font-bold text-white flex items-center justify-center shrink-0">
                                AI
                            </div>
                            <div className="rounded-2xl px-4 py-3 border border-white/10 bg-white/5 text-gray-300 text-sm flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" />
                                <span className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '120ms' }} />
                                <span className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '240ms' }} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-black/40">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 rounded-xl bg-black/50 border border-white/10 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={triageQuestions.length > 0 ? 'Answer the question above...' : 'Type your symptoms here...'}
                            value={composerText}
                            onChange={(event) => setComposerText(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    if (!isAnalyzing) {
                                        void handleSend();
                                    }
                                }
                            }}
                            disabled={isAnalyzing}
                        />
                        <button
                            onClick={() => {
                                void handleSend();
                            }}
                            disabled={isAnalyzing || !composerText.trim()}
                            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/60 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
                        >
                            Send
                        </button>
                    </div>

                    <div className="mt-3 text-[11px] text-yellow-200/80 border border-yellow-500/20 bg-yellow-500/5 rounded-lg px-3 py-2">
                        Disclaimer: This AI chat is for guidance only and not a diagnosis. For severe chest pain or breathing difficulty, seek emergency care immediately.
                    </div>
                </div>
            </div>
        </div>
    );
}
