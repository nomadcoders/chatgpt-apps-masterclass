import { useApp } from "@modelcontextprotocol/ext-apps/react";
import { LoadingIndicator } from "@openai/apps-sdk-ui/components/Indicator";
import { useState } from "react";

interface ToolOutput {
  movies?: Record<string, string>;
  movie?: Record<string, string>;
}

function App() {
  const [toolOutput, setToolOutput] = useState<ToolOutput | null>(null);

  useApp({
    appInfo: { name: "Movies Client", version: "1.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolresult = (result) => {
        if (result.structuredContent) {
          setToolOutput(result.structuredContent);
        }
      };
    },
  });

  if (toolOutput?.movies) {
    return <MoviesList movies={toolOutput.movies} />;
  }

  if (toolOutput?.movie) {
    return <MovieDetails movie={toolOutput.movie} />;
  }

  return (
    <div className="items-center justify-center flex min-h-50">
      <LoadingIndicator size={32} />
    </div>
  );
}

export default App;
