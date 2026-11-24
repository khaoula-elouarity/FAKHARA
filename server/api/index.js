import app from "../index.js";

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
};

export default function handler(request, response) {
  return app(request, response);
}
