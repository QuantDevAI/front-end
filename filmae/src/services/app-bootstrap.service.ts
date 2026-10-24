import { resolveStartupRoute } from '@/services/session-route.service';

export type AppBootstrapResult = {
  initialRoute: Awaited<ReturnType<typeof resolveStartupRoute>>;
};

export const appBootstrapService = {
  async initialize(): Promise<AppBootstrapResult> {
    return {
      initialRoute: await resolveStartupRoute(),
    };
  },
};
