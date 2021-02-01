
/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/


/**
 * AUTO-GENERATED FILE. DO NOT MODIFY.
 */

import { each, indexOf, curry, assert, map, createHashMap } from 'zrender/lib/core/util';
import * as graphic from '../../util/graphic';
import * as brushHelper from './brushHelper';
import { parseFinder as modelUtilParseFinder } from '../../util/model';
var COORD_CONVERTS = ['dataToPoint', 'pointToData'];
var INCLUDE_FINDER_MAIN_TYPES = ['grid', 'xAxis', 'yAxis', 'geo', 'graph', 'polar', 'radiusAxis', 'angleAxis', 'bmap'];

var BrushTargetManager = function () {
  function BrushTargetManager(finder, ecModel, opt) {
    var _this = this;

    this._targetInfoList = [];
    var foundCpts = parseFinder(ecModel, finder);
    each(targetInfoBuilders, function (builder, type) {
      if (!opt || !opt.include || indexOf(opt.include, type) >= 0) {
        builder(foundCpts, _this._targetInfoList);
      }
    });
  }

  BrushTargetManager.prototype.setOutputRanges = function (areas, ecModel) {
    this.matchOutputRanges(areas, ecModel, function (area, coordRange, coordSys) {
      (area.coordRanges || (area.coordRanges = [])).push(coordRange);

      if (!area.coordRange) {
        area.coordRange = coordRange;
        var result = coordConvert[area.brushType](0, coordSys, coordRange);
        area.__rangeOffset = {
          offset: diffProcessor[area.brushType](result.values, area.range, [1, 1]),
          xyMinMax: result.xyMinMax
        };
      }
    });
    return areas;
  };

  BrushTargetManager.prototype.matchOutputRanges = function (areas, ecModel, cb) {
    each(areas, function (area) {
      var targetInfo = this.findTargetInfo(area, ecModel);

      if (targetInfo && targetInfo !== true) {
        each(targetInfo.coordSyses, function (coordSys) {
          var result = coordConvert[area.brushType](1, coordSys, area.range);
          cb(area, result.values, coordSys, ecModel);
        });
      }
    }, this);
  };

  BrushTargetManager.prototype.setInputRanges = function (areas, ecModel) {
    each(areas, function (area) {
      var targetInfo = this.findTargetInfo(area, ecModel);

      if (process.env.NODE_ENV !== 'production') {
        assert(!targetInfo || targetInfo === true || area.coordRange, 'coordRange must be specified when coord index specified.');
        assert(!targetInfo || targetInfo !== true || area.range, 'range must be specified in global brush.');
      }

      area.range = area.range || [];

      if (targetInfo && targetInfo !== true) {
        area.panelId = targetInfo.panelId;
        var result = coordConvert[area.brushType](0, targetInfo.coordSys, area.coordRange);
        var rangeOffset = area.__rangeOffset;
        area.range = rangeOffset ? diffProcessor[area.brushType](result.values, rangeOffset.offset, getScales(result.xyMinMax, rangeOffset.xyMinMax)) : result.values;
      }
    }, this);
  };

  BrushTargetManager.prototype.makePanelOpts = function (api, getDefaultBrushType) {
    return map(this._targetInfoList, function (targetInfo) {
      var rect = targetInfo.getPanelRect();
      return {
        panelId: targetInfo.panelId,
        defaultBrushType: getDefaultBrushType ? getDefaultBrushType(targetInfo) : null,
        clipPath: brushHelper.makeRectPanelClipPath(rect),
        isTargetByCursor: brushHelper.makeRectIsTargetByCursor(rect, api, targetInfo.coordSysModel),
        getLinearBrushOtherExtent: brushHelper.makeLinearBrushOtherExtent(rect)
      };
    });
  };

  BrushTargetManager.prototype.controlSeries = function (area, seriesModel, ecModel) {
    var targetInfo = this.findTargetInfo(area, ecModel);
    return targetInfo === true || targetInfo && indexOf(targetInfo.coordSyses, seriesModel.coordinateSystem) >= 0;
  };

  BrushTargetManager.prototype.findTargetInfo = function (area, ecModel) {
    var targetInfoList = this._targetInfoList;
    var foundCpts = parseFinder(ecModel, area);

    for (var i = 0; i < targetInfoList.length; i++) {
      var targetInfo = targetInfoList[i];
      var areaPanelId = area.panelId;

      if (areaPanelId) {
        if (targetInfo.panelId === areaPanelId) {
          return targetInfo;
        }
      } else {
        for (var j = 0; j < targetInfoMatchers.length; j++) {
          if (targetInfoMatchers[j](foundCpts, targetInfo)) {
            return targetInfo;
          }
        }
      }
    }

    return true;
  };

  return BrushTargetManager;
}();

function formatMinMax(minMax) {
  minMax[0] > minMax[1] && minMax.reverse();
  return minMax;
}

function parseFinder(ecModel, finder) {
  return modelUtilParseFinder(ecModel, finder, {
    includeMainTypes: INCLUDE_FINDER_MAIN_TYPES
  });
}

var targetInfoBuilders = {
  grid: function (foundCpts, targetInfoList) {
    var xAxisModels = foundCpts.xAxisModels;
    var yAxisModels = foundCpts.yAxisModels;
    var gridModels = foundCpts.gridModels;
    var gridModelMap = createHashMap();
    var xAxesHas = {};
    var yAxesHas = {};

    if (!xAxisModels && !yAxisModels && !gridModels) {
      return;
    }

    each(xAxisModels, function (axisModel) {
      var gridModel = axisModel.axis.grid.model;
      gridModelMap.set(gridModel.id, gridModel);
      xAxesHas[gridModel.id] = true;
    });
    each(yAxisModels, function (axisModel) {
      var gridModel = axisModel.axis.grid.model;
      gridModelMap.set(gridModel.id, gridModel);
      yAxesHas[gridModel.id] = true;
    });
    each(gridModels, function (gridModel) {
      gridModelMap.set(gridModel.id, gridModel);
      xAxesHas[gridModel.id] = true;
      yAxesHas[gridModel.id] = true;
    });
    gridModelMap.each(function (gridModel) {
      var grid = gridModel.coordinateSystem;
      var cartesians = [];
      each(grid.getCartesians(), function (cartesian, index) {
        if (indexOf(xAxisModels, cartesian.getAxis('x').model) >= 0 || indexOf(yAxisModels, cartesian.getAxis('y').model) >= 0) {
          cartesians.push(cartesian);
        }
      });
      targetInfoList.push({
        panelId: 'grid--' + gridModel.id,
        gridModel: gridModel,
        coordSysModel: gridModel,
        coordSys: cartesians[0],
        coordSyses: cartesians,
        getPanelRect: panelRectBuilders.grid,
        xAxisDeclared: xAxesHas[gridModel.id],
        yAxisDeclared: yAxesHas[gridModel.id]
      });
    });
  },
  geo: function (foundCpts, targetInfoList) {
    each(foundCpts.geoModels, function (geoModel) {
      var coordSys = geoModel.coordinateSystem;
      targetInfoList.push({
        panelId: 'geo--' + geoModel.id,
        geoModel: geoModel,
        coordSysModel: geoModel,
        coordSys: coordSys,
        coordSyses: [coordSys],
        getPanelRect: panelRectBuilders.geo
      });
    });
  }
};
var targetInfoMatchers = [function (foundCpts, targetInfo) {
  var xAxisModel = foundCpts.xAxisModel;
  var yAxisModel = foundCpts.yAxisModel;
  var gridModel = foundCpts.gridModel;
  !gridModel && xAxisModel && (gridModel = xAxisModel.axis.grid.model);
  !gridModel && yAxisModel && (gridModel = yAxisModel.axis.grid.model);
  return gridModel && gridModel === targetInfo.gridModel;
}, function (foundCpts, targetInfo) {
  var geoModel = foundCpts.geoModel;
  return geoModel && geoModel === targetInfo.geoModel;
}];
var panelRectBuilders = {
  grid: function () {
    return this.coordSys.master.getRect().clone();
  },
  geo: function () {
    var coordSys = this.coordSys;
    var rect = coordSys.getBoundingRect().clone();
    rect.applyTransform(graphic.getTransform(coordSys));
    return rect;
  }
};
var coordConvert = {
  lineX: curry(axisConvert, 0),
  lineY: curry(axisConvert, 1),
  rect: function (to, coordSys, rangeOrCoordRange) {
    var xminymin = coordSys[COORD_CONVERTS[to]]([rangeOrCoordRange[0][0], rangeOrCoordRange[1][0]]);
    var xmaxymax = coordSys[COORD_CONVERTS[to]]([rangeOrCoordRange[0][1], rangeOrCoordRange[1][1]]);
    var values = [formatMinMax([xminymin[0], xmaxymax[0]]), formatMinMax([xminymin[1], xmaxymax[1]])];
    return {
      values: values,
      xyMinMax: values
    };
  },
  polygon: function (to, coordSys, rangeOrCoordRange) {
    var xyMinMax = [[Infinity, -Infinity], [Infinity, -Infinity]];
    var values = map(rangeOrCoordRange, function (item) {
      var p = coordSys[COORD_CONVERTS[to]](item);
      xyMinMax[0][0] = Math.min(xyMinMax[0][0], p[0]);
      xyMinMax[1][0] = Math.min(xyMinMax[1][0], p[1]);
      xyMinMax[0][1] = Math.max(xyMinMax[0][1], p[0]);
      xyMinMax[1][1] = Math.max(xyMinMax[1][1], p[1]);
      return p;
    });
    return {
      values: values,
      xyMinMax: xyMinMax
    };
  }
};

function axisConvert(axisNameIndex, to, coordSys, rangeOrCoordRange) {
  if (process.env.NODE_ENV !== 'production') {
    assert(coordSys.type === 'cartesian2d', 'lineX/lineY brush is available only in cartesian2d.');
  }

  var axis = coordSys.getAxis(['x', 'y'][axisNameIndex]);
  var values = formatMinMax(map([0, 1], function (i) {
    return to ? axis.coordToData(axis.toLocalCoord(rangeOrCoordRange[i])) : axis.toGlobalCoord(axis.dataToCoord(rangeOrCoordRange[i]));
  }));
  var xyMinMax = [];
  xyMinMax[axisNameIndex] = values;
  xyMinMax[1 - axisNameIndex] = [NaN, NaN];
  return {
    values: values,
    xyMinMax: xyMinMax
  };
}

var diffProcessor = {
  lineX: curry(axisDiffProcessor, 0),
  lineY: curry(axisDiffProcessor, 1),
  rect: function (values, refer, scales) {
    return [[values[0][0] - scales[0] * refer[0][0], values[0][1] - scales[0] * refer[0][1]], [values[1][0] - scales[1] * refer[1][0], values[1][1] - scales[1] * refer[1][1]]];
  },
  polygon: function (values, refer, scales) {
    return map(values, function (item, idx) {
      return [item[0] - scales[0] * refer[idx][0], item[1] - scales[1] * refer[idx][1]];
    });
  }
};

function axisDiffProcessor(axisNameIndex, values, refer, scales) {
  return [values[0] - scales[axisNameIndex] * refer[0], values[1] - scales[axisNameIndex] * refer[1]];
}

function getScales(xyMinMaxCurr, xyMinMaxOrigin) {
  var sizeCurr = getSize(xyMinMaxCurr);
  var sizeOrigin = getSize(xyMinMaxOrigin);
  var scales = [sizeCurr[0] / sizeOrigin[0], sizeCurr[1] / sizeOrigin[1]];
  isNaN(scales[0]) && (scales[0] = 1);
  isNaN(scales[1]) && (scales[1] = 1);
  return scales;
}

function getSize(xyMinMax) {
  return xyMinMax ? [xyMinMax[0][1] - xyMinMax[0][0], xyMinMax[1][1] - xyMinMax[1][0]] : [NaN, NaN];
}

export default BrushTargetManager;