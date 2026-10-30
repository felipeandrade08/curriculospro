"use client";

import {useEffect} from "react";
import {trackUsage,type UsageEvent} from "@/lib/analytics";

export function UsageBeacon({event="site_visit"}:{event?:UsageEvent}) {
  useEffect(()=>{trackUsage(event)},[event]);
  return null;
}
