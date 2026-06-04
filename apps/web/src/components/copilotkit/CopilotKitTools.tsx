import { AddAddonFrontendTool } from './tools/AddAddonFrontendTool';
import { RemoveAddonFrontendTool } from './tools/RemoveAddonFrontendTool';
import { UpdateSettingsFrontendTool } from './tools/UpdateSettingsFrontendTool';
import {
  ServiceChangePreviewTool,
  ConfirmServiceChangeTool,
} from './tools/ServiceChangePreviewTool';
import { CustomerDataReadable } from './readables/CustomerDataReadable';

function CopilotKitTools() {
  return (
    <>
      {/* Readables */}
      <CustomerDataReadable />

      {/* Frontend Tools */}
      <AddAddonFrontendTool />
      <RemoveAddonFrontendTool />
      <UpdateSettingsFrontendTool />
      <ServiceChangePreviewTool />

      {/* Human-in-the-Loop Tools */}
      <ConfirmServiceChangeTool />
    </>
  );
}

export default CopilotKitTools;
