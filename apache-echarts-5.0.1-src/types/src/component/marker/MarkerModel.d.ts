import { DataFormatMixin } from '../../model/mixin/dataFormat';
import ComponentModel from '../../model/Component';
import SeriesModel from '../../model/Series';
import { ComponentOption, AnimationOptionMixin, CommonTooltipOption, ScaleDataValue } from '../../util/types';
import Model from '../../model/Model';
import GlobalModel from '../../model/Global';
import List from '../../data/List';
export declare type MarkerStatisticType = 'average' | 'min' | 'max' | 'median';
export interface MarkerPositionOption {
    x?: number | string;
    y?: number | string;
    coord?: (ScaleDataValue | MarkerStatisticType)[];
    xAxis?: ScaleDataValue;
    yAxis?: ScaleDataValue;
    radiusAxis?: ScaleDataValue;
    angleAxis?: ScaleDataValue;
    type?: MarkerStatisticType;
    valueIndex?: number;
    valueDim?: string;
    value?: string | number;
}
export interface MarkerOption extends ComponentOption, AnimationOptionMixin {
    silent?: boolean;
    data?: unknown[];
    tooltip?: CommonTooltipOption<unknown> & {
        trigger?: 'item' | 'axis' | boolean | 'none';
    };
}
declare abstract class MarkerModel<Opts extends MarkerOption = MarkerOption> extends ComponentModel<Opts> {
    static type: string;
    type: string;
    createdBySelf: boolean;
    static readonly dependencies: string[];
    __hostSeries: SeriesModel;
    private _data;
    init(option: Opts, parentModel: Model, ecModel: GlobalModel): void;
    isAnimationEnabled(): boolean;
    mergeOption(newOpt: Opts, ecModel: GlobalModel): void;
    _mergeOption(newOpt: Opts, ecModel: GlobalModel, createdBySelf?: boolean, isInit?: boolean): void;
    formatTooltip(dataIndex: number, multipleSeries: boolean, dataType: string): import("../tooltip/tooltipMarkup").TooltipMarkupSection;
    getData(): List<this>;
    setData(data: List): void;
    abstract createMarkerModelFromSeries(markerOpt: Opts, masterMarkerModel: MarkerModel, ecModel: GlobalModel): MarkerModel;
    static getMarkerModelFromSeries(seriesModel: SeriesModel, componentType: 'markLine' | 'markPoint' | 'markArea'): MarkerModel<MarkerOption>;
}
interface MarkerModel<Opts extends MarkerOption = MarkerOption> extends DataFormatMixin {
}
export default MarkerModel;
