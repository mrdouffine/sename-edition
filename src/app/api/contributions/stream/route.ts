import { handleApiError } from "@/lib/api";
import { asObjectId } from "@/lib/validation/common";
import { getCampaignSnapshot } from "@/lib/services/contributionService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = asObjectId(searchParams.get("bookId"), "bookId");
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        let closed = false;

        const push = async () => {
          if (closed) return;
          try {
            const snapshot = await getCampaignSnapshot(bookId);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(snapshot)}\n\n`));
          } catch (error) {
            const message = error instanceof Error ? error.message : "stream_error";
            controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`));
          }
        };

        void push();
        const interval = setInterval(() => {
          void push();
        }, 5000);

        const onAbort = () => {
          closed = true;
          clearInterval(interval);
          try {
            controller.close();
          } catch {
            // no-op if already closed
          }
        };

        request.signal.addEventListener("abort", onAbort);
      }
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive"
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
