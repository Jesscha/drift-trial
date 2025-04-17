import { TriggerCondition } from "@/types/orders";
import { useTradingStore } from "@/app/stores/tradingStore";
import { CustomDropdown } from "../CustomDropdown";

export const TriggerConditionDropdown = () => {
  const triggerCondition = useTradingStore((state) => state.triggerCondition);
  const setTriggerCondition = useTradingStore(
    (state) => state.setTriggerCondition
  );
  const handleTriggerConditionChange = (value: string | number) => {
    setTriggerCondition(Number(value));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm text-neutrals-80 dark:text-neutrals-30">
          Trigger Condition
        </div>
        <div className="w-24">
          <CustomDropdown
            options={[
              { value: TriggerCondition.ABOVE, label: "Above" },
              { value: TriggerCondition.BELOW, label: "Below" },
            ]}
            value={triggerCondition}
            onChange={handleTriggerConditionChange}
            renderOption={(option) => (
              <span className="font-medium text-sm">{option.label}</span>
            )}
            className="py-1 px-2"
            dropdownClassName="right-0 left-auto w-24"
          />
        </div>
      </div>
    </div>
  );
};
