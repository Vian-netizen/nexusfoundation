export async function handler(event) {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return {
      statusCode: 400,
      body: "Missing code"
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Callback received",
      code
    })
  };
}