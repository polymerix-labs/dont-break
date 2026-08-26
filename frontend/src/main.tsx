/**
 * Copyright 2026 Polymerix
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "./design";
import { initI18n } from "./i18n";
import { router } from "./router";
import { SessionProvider } from "./shell/SessionContext";
import { ViewerProvider } from "./shell/ViewerContext";
import "./index.css";
initI18n();
const DesignDemo = import.meta.env.DEV
    ? lazy(() => import("./design/DesignDemo"))
    : null;
const showDesignDemo = DesignDemo && window.location.hash === "#design";
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 15000,
            refetchOnWindowFocus: false,
        },
    },
});
createRoot(document.getElementById("root")!).render(<StrictMode>
    {showDesignDemo && DesignDemo ? (<Suspense fallback={null}>
        <DesignDemo />
      </Suspense>) : (<QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ViewerProvider>
            <ToastProvider>
              <RouterProvider router={router}/>
            </ToastProvider>
          </ViewerProvider>
        </SessionProvider>
      </QueryClientProvider>)}
  </StrictMode>);
