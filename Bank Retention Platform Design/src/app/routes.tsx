import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ExecutiveDashboard } from "./components/ExecutiveDashboard";
import { RetentionWorkspace } from "./components/RetentionWorkspace";
import { CustomerDetail } from "./components/CustomerDetail";
import { ModelGovernance } from "./components/ModelGovernance";
import { CampaignCenter } from "./components/CampaignCenter";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: ExecutiveDashboard },
      { path: "workspace", Component: RetentionWorkspace },
      { path: "customer/:customerId", Component: CustomerDetail },
      { path: "model-governance", Component: ModelGovernance },
      { path: "campaigns", Component: CampaignCenter },
    ],
  },
]);
