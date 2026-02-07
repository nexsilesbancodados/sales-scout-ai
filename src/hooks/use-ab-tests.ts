import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface ABTestVariant {
  id: string;
  name: string;
  templateId: string;
  content: string;
  sent: number;
  responses: number;
  conversions: number;
}

export interface ABTest {
  id: string;
  name: string;
  niche: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: ABTestVariant[];
  startedAt?: string;
  completedAt?: string;
  winnerId?: string;
  minSampleSize: number;
  confidence: number;
}

// Store tests in localStorage for persistence
const STORAGE_KEY = 'ab_tests';

function loadTests(): ABTest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveTests(tests: ABTest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
}

export function useABTests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['ab-tests', user?.id],
    queryFn: () => loadTests(),
    enabled: !!user?.id,
  });

  const createTest = useMutation({
    mutationFn: async (test: Omit<ABTest, 'id'>) => {
      const newTest: ABTest = {
        ...test,
        id: Date.now().toString(),
      };
      const updatedTests = [newTest, ...loadTests()];
      saveTests(updatedTests);
      return newTest;
    },
    onSuccess: (test) => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast({
        title: 'Teste A/B criado!',
        description: `O teste "${test.name}" foi iniciado.`,
      });
    },
  });

  const updateTest = useMutation({
    mutationFn: async (update: Partial<ABTest> & { id: string }) => {
      const tests = loadTests();
      const index = tests.findIndex(t => t.id === update.id);
      if (index >= 0) {
        tests[index] = { ...tests[index], ...update };
        saveTests(tests);
        return tests[index];
      }
      throw new Error('Test not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    },
  });

  const deleteTest = useMutation({
    mutationFn: async (testId: string) => {
      const tests = loadTests().filter(t => t.id !== testId);
      saveTests(tests);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast({
        title: 'Teste excluído',
      });
    },
  });

  const recordImpression = useCallback(async (testId: string, variantId: string) => {
    const tests = loadTests();
    const test = tests.find(t => t.id === testId);
    if (!test || test.status !== 'running') return null;

    const variant = test.variants.find(v => v.id === variantId);
    if (variant) {
      variant.sent++;
      saveTests(tests);
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    }
    return variant;
  }, [queryClient]);

  const recordResponse = useCallback(async (testId: string, variantId: string) => {
    const tests = loadTests();
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    const variant = test.variants.find(v => v.id === variantId);
    if (variant) {
      variant.responses++;
      saveTests(tests);
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    }
  }, [queryClient]);

  const recordConversion = useCallback(async (testId: string, variantId: string) => {
    const tests = loadTests();
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    const variant = test.variants.find(v => v.id === variantId);
    if (variant) {
      variant.conversions++;
      saveTests(tests);
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
    }
  }, [queryClient]);

  // Get a random variant for a running test
  const getVariantForLead = useCallback((testId: string) => {
    const tests = loadTests();
    const test = tests.find(t => t.id === testId && t.status === 'running');
    if (!test || test.variants.length === 0) return null;

    // Simple 50/50 split
    const randomIndex = Math.random() < 0.5 ? 0 : 1;
    return test.variants[randomIndex];
  }, []);

  // Calculate statistical significance
  const calculateSignificance = useCallback((testId: string): number => {
    const tests = loadTests();
    const test = tests.find(t => t.id === testId);
    if (!test || test.variants.length < 2) return 0;

    const [a, b] = test.variants;
    const rateA = a.sent > 0 ? a.responses / a.sent : 0;
    const rateB = b.sent > 0 ? b.responses / b.sent : 0;

    if (a.sent === 0 || b.sent === 0) return 0;

    const pooledRate = (a.responses + b.responses) / (a.sent + b.sent);
    if (pooledRate === 0 || pooledRate === 1) return 0;

    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/a.sent + 1/b.sent));
    if (standardError === 0) return 0;

    const zScore = Math.abs(rateA - rateB) / standardError;

    // Convert z-score to confidence level
    if (zScore >= 2.576) return 99;
    if (zScore >= 1.96) return 95;
    if (zScore >= 1.645) return 90;
    return Math.min(89, Math.round(zScore * 30));
  }, []);

  // Get winner variant
  const getWinner = useCallback((testId: string): ABTestVariant | null => {
    const tests = loadTests();
    const test = tests.find(t => t.id === testId);
    if (!test || test.variants.length < 2) return null;

    const sorted = [...test.variants].sort((a, b) => {
      const rateA = a.sent > 0 ? a.responses / a.sent : 0;
      const rateB = b.sent > 0 ? b.responses / b.sent : 0;
      return rateB - rateA;
    });

    return sorted[0];
  }, []);

  // Check if test should be completed
  const checkTestCompletion = useCallback((testId: string) => {
    const tests = loadTests();
    const test = tests.find(t => t.id === testId);
    if (!test || test.status !== 'running') return;

    const totalSent = test.variants.reduce((sum, v) => sum + v.sent, 0);
    const minTotal = test.minSampleSize * test.variants.length;
    const confidence = calculateSignificance(testId);

    if (totalSent >= minTotal && confidence >= 95) {
      const winner = getWinner(testId);
      updateTest.mutate({
        id: testId,
        status: 'completed',
        completedAt: new Date().toISOString(),
        winnerId: winner?.id,
        confidence,
      });

      toast({
        title: '🏆 Teste A/B concluído!',
        description: `${winner?.name} venceu com ${confidence}% de confiança.`,
      });
    }
  }, [calculateSignificance, getWinner, updateTest, toast]);

  return {
    tests,
    isLoading,
    createTest,
    updateTest,
    deleteTest,
    recordImpression,
    recordResponse,
    recordConversion,
    getVariantForLead,
    calculateSignificance,
    getWinner,
    checkTestCompletion,
  };
}
