import { prisma } from "../utilities/db.js";
export const FeedbackHtml = async () => {
  const feedback = await prisma.feedback.findMany({
    orderBy: {
      savedAt: "desc",
    },
  });

  return (
    <div class="flex flex-col items-center">
      <h1 class="text-xl">Feedback</h1>
      <table class="text-xl">
        {feedback.map((feedback) => (
          <tr id={`row-${feedback.id}`}>
            <td class="border border-black border-2 p-2">{feedback.message}</td>
            <td class="border border-black border-2 p-2">
              {feedback.savedAt.toISOString()}
            </td>
            <td
              hx-ext="json-enc"
              hx-delete={`/feedback-remove/${feedback.id}`}
              hx-target={`#row-${feedback.id}`}
              hx-swap="delete"
              class="border border-black border-2 p-2"
            >
              <button>🗑️</button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
};
