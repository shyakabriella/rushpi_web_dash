import SellerVerificationWorkspace from "@/components/seller/seller-verification-workspace";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Verification | RushPi",
  description:
    "Manage seller verification documents and review RushPi administration decisions.",
};

export default function SellerVerificationPage() {
  return <SellerVerificationWorkspace />;
}