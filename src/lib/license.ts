// utils/customLicenseUtils.ts

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function getRandom8(): string {
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

// Helper: format Date object as 'yyyy-MM-dd'
function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Generate custom license key — accepts mac string and Date objects for fromDate/toDate
export function generateCustomLicense(
  mac: string,
  fromDate: Date,
  toDate: Date,
  plan: any
): string {
  const fromDateStr = formatDate(fromDate);
  const toDateStr = formatDate(toDate);

  const cleanMac = mac.replace(/-/g, "").toUpperCase();
  const rawData = cleanMac + fromDateStr.replace(/-/g, "") + toDateStr.replace(/-/g, "");

  let license = getRandom8(); // Initial random block

  for (let ch of rawData) {
    license += ch + getRandom8();
  }

  const planDataStr = JSON.stringify({
    planName: plan.planName,
    SnHttpClient: plan.SnHttpClient,
    SnScheduler: plan.SnScheduler,
    SnAlarm: plan.SnAlarm,
    SnHistory: plan.SnHistory,
  });

  const encodedPlan = Buffer.from(planDataStr).toString("base64");
 
  license += "S15" + encodedPlan; // Use S15 as delimiter

  return license;
}



// Decrypt license key — unchanged, returns structured JSON object
export function decryptCustomLicense(license: string): Record<string, any> {
  if (!license || license.length < 252) {
    return {
      result: false,
      message: "Invalid license length."
    };
  }

  try {
    const [mainPart, encodedPlan] = license.split("S15");

    let original = "";
    for (let i = 8; i < mainPart.length; i += 9) {
      original += mainPart[i];
    }

    if (original.length !== 28) {
      return {
        result: false,
        message: "Corrupted license data."
      };
    }

    const macRaw = original.substring(0, 12);
    const fromDateRaw = original.substring(12, 20);
    const toDateRaw = original.substring(20, 28);

    const formattedMac = macRaw.match(/.{1,2}/g)?.join("-") || "";
    const fromDate = `${fromDateRaw.substring(0, 4)}-${fromDateRaw.substring(4, 6)}-${fromDateRaw.substring(6, 8)}`;
    const toDate = `${toDateRaw.substring(0, 4)}-${toDateRaw.substring(4, 6)}-${toDateRaw.substring(6, 8)}`;

    const planDetails = encodedPlan
      ? JSON.parse(Buffer.from(encodedPlan, "base64").toString("utf-8"))
      : null;

    return {
      result: true,
      mac: formattedMac,
      fromDate,
      toDate,
      plan: planDetails,
      message: "License decoded successfully."
    };
  } catch (e: any) {
    return {
      result: false,
      message: e.message
    };
  }
}


