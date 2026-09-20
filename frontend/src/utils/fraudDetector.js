export function detectFraud(job) {
  let score = 0;
  let reasons = [];

  if (job.salary > 100000) {
    score += 30;
    reasons.push("Unrealistic salary offered");
  }

  if (job.email.includes("gmail") || job.email.includes("yahoo")) {
    score += 20;
    reasons.push("Free email domain used");
  }

  if (job.description.length < 50) {
    score += 20;
    reasons.push("Very short job description");
  }

  if (/pay|fee|registration|deposit/i.test(job.description)) {
    score += 30;
    reasons.push("Advance payment keywords detected");
  }

  let risk =
    score >= 70 ? "High Risk" :
    score >= 40 ? "Medium Risk" :
    "Low Risk";

  return { score, risk, reasons };
}
