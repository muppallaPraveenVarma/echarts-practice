import * as featureManager from './featureManager';
import ComponentModel from '../../model/Component';
import { ComponentOption, BoxLayoutOptionMixin, LayoutOrient, ZRColor, BorderOptionMixin, ItemStyleOption, LabelOption, CommonTooltipOption, Dictionary } from '../../util/types';
export interface ToolboxTooltipFormatterParams {
    componentType: 'toolbox';
    name: string;
    title: string;
    $vars: ['name', 'title'];
}
export interface ToolboxOption extends ComponentOption, BoxLayoutOptionMixin, BorderOptionMixin {
    mainType?: 'toolbox';
    show?: boolean;
    orient?: LayoutOrient;
    backgroundColor?: ZRColor;
    borderRadius?: number | number[];
    padding?: number | number[];
    itemSize?: number;
    itemGap?: number;
    showTitle?: boolean;
    iconStyle?: ItemStyleOption;
    emphasis?: {
        iconStyle?: ItemStyleOption;
    };
    textStyle?: LabelOption;
    tooltip?: CommonTooltipOption<ToolboxTooltipFormatterParams>;
    feature?: Partial<Dictionary<featureManager.ToolboxFeatureOption>>;
}
declare class ToolboxModel extends ComponentModel<ToolboxOption> {
    static type: "toolbox";
    type: "toolbox";
    static layoutMode: {
        readonly type: "box";
        readonly ignoreSize: true;
    };
    optionUpdated(): void;
    static defaultOption: ToolboxOption;
}
export default ToolboxModel;
