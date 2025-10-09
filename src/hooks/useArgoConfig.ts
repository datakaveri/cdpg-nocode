import { useState } from "react";
import { toast } from "react-toastify";
import { env } from "../environments/environments";

export default function useArgoConfig() {
  const [argoConfig, setArgoConfig] = useState({
    url: env.argoUrl,
    token: env.argoToken,
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempConfig, setTempConfig] = useState({ ...argoConfig });

  const handleConfigModal = () => setShowConfigModal((p) => !p);

  const handleConfigSave = () => {
    setArgoConfig(tempConfig);
    setShowConfigModal(false);
    toast.success("Argo config saved");
  };

  return {
    argoConfig,
    showConfigModal,
    handleConfigModal,
    tempConfig,
    setTempConfig,
    handleConfigSave,
  };
}
