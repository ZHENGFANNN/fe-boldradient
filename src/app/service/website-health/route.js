/** @format */

export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/service-health`);
    const { code } = await res.json();
    if (code === 0) {
      return Response.json({
        Website: "Health",
        Service: "Health",
      });
    } else {
      throw new Error("code !== 0");
    }
  } catch {
    return Response.json({
      Website: "Health",
      Service: "Failed",
    });
  }
}
