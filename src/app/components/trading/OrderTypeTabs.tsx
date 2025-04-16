import { CustomDropdown } from "../CustomDropdown";
import { useOrderType } from "@/app/hooks/trading";
import { isTriggerOrderType } from "../modal/TradingModal.util";

export const OrderTypeTabs = () => {
  const {
    activeTab,
    orderTabs,
    proOrderOptions,
    handleTabChange,
    handleProOrderSelect,
  } = useOrderType();

  return (
    <div className="flex border-b border-neutrals-20 dark:border-neutrals-70 mb-1 justify-between">
      {orderTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabChange(tab)}
          className={`px-6 py-1 font-medium text-sm transition-colors relative ${
            activeTab === tab
              ? "text-purple-50"
              : "text-neutrals-60 dark:text-neutrals-40 hover:text-neutrals-100 dark:hover:text-neutrals-0"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50"></div>
          )}
        </button>
      ))}

      <div className={`w-36 relative`}>
        <CustomDropdown
          options={proOrderOptions}
          value={
            proOrderOptions.some((opt) => opt.value === activeTab)
              ? activeTab
              : "Pro Orders"
          }
          onChange={handleProOrderSelect}
          placeholder="Pro Orders"
          renderOption={(option) => (
            <span className="font-medium text-sm">{option.label}</span>
          )}
          className={`py-1 px-2 border-none bg-transparent ${
            isTriggerOrderType(activeTab) ? "text-purple-50" : ""
          }`}
          dropdownClassName="right-0 left-auto w-36"
        />
        {isTriggerOrderType(activeTab) && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50"></div>
        )}
      </div>
    </div>
  );
};
