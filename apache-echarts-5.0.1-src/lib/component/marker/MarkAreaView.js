
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

import { __extends } from "tslib";
import * as colorUtil from 'zrender/lib/tool/color';
import List from '../../data/List';
import * as numberUtil from '../../util/number';
import * as graphic from '../../util/graphic';
import { enableHoverEmphasis, setStatesStylesFromModel } from '../../util/states';
import * as markerHelper from './markerHelper';
import MarkerView from './MarkerView';
import { retrieve, mergeAll, map, defaults, curry, filter, each } from 'zrender/lib/core/util';
import { isCoordinateSystemType } from '../../coord/CoordinateSystem';
import MarkerModel from './MarkerModel';
import { makeInner } from '../../util/model';
import { getVisualFromData } from '../../visual/helper';
import { setLabelStyle, getLabelStatesModels } from '../../label/labelStyle';
import { getECData } from '../../util/innerStore';
var inner = makeInner();

var markAreaTransform = function (seriesModel, coordSys, maModel, item) {
  var lt = markerHelper.dataTransform(seriesModel, item[0]);
  var rb = markerHelper.dataTransform(seriesModel, item[1]);
  var ltCoord = lt.coord;
  var rbCoord = rb.coord;
  ltCoord[0] = retrieve(ltCoord[0], -Infinity);
  ltCoord[1] = retrieve(ltCoord[1], -Infinity);
  rbCoord[0] = retrieve(rbCoord[0], Infinity);
  rbCoord[1] = retrieve(rbCoord[1], Infinity);
  var result = mergeAll([{}, lt, rb]);
  result.coord = [lt.coord, rb.coord];
  result.x0 = lt.x;
  result.y0 = lt.y;
  result.x1 = rb.x;
  result.y1 = rb.y;
  return result;
};

function isInifinity(val) {
  return !isNaN(val) && !isFinite(val);
}

function ifMarkAreaHasOnlyDim(dimIndex, fromCoord, toCoord, coordSys) {
  var otherDimIndex = 1 - dimIndex;
  return isInifinity(fromCoord[otherDimIndex]) && isInifinity(toCoord[otherDimIndex]);
}

function markAreaFilter(coordSys, item) {
  var fromCoord = item.coord[0];
  var toCoord = item.coord[1];

  if (isCoordinateSystemType(coordSys, 'cartesian2d')) {
    if (fromCoord && toCoord && (ifMarkAreaHasOnlyDim(1, fromCoord, toCoord, coordSys) || ifMarkAreaHasOnlyDim(0, fromCoord, toCoord, coordSys))) {
      return true;
    }
  }

  return markerHelper.dataFilter(coordSys, {
    coord: fromCoord,
    x: item.x0,
    y: item.y0
  }) || markerHelper.dataFilter(coordSys, {
    coord: toCoord,
    x: item.x1,
    y: item.y1
  });
}

function getSingleMarkerEndPoint(data, idx, dims, seriesModel, api) {
  var coordSys = seriesModel.coordinateSystem;
  var itemModel = data.getItemModel(idx);
  var point;
  var xPx = numberUtil.parsePercent(itemModel.get(dims[0]), api.getWidth());
  var yPx = numberUtil.parsePercent(itemModel.get(dims[1]), api.getHeight());

  if (!isNaN(xPx) && !isNaN(yPx)) {
    point = [xPx, yPx];
  } else {
    if (seriesModel.getMarkerPosition) {
      point = seriesModel.getMarkerPosition(data.getValues(dims, idx));
    } else {
      var x = data.get(dims[0], idx);
      var y = data.get(dims[1], idx);
      var pt = [x, y];
      coordSys.clampData && coordSys.clampData(pt, pt);
      point = coordSys.dataToPoint(pt, true);
    }

    if (isCoordinateSystemType(coordSys, 'cartesian2d')) {
      var xAxis = coordSys.getAxis('x');
      var yAxis = coordSys.getAxis('y');
      var x = data.get(dims[0], idx);
      var y = data.get(dims[1], idx);

      if (isInifinity(x)) {
        point[0] = xAxis.toGlobalCoord(xAxis.getExtent()[dims[0] === 'x0' ? 0 : 1]);
      } else if (isInifinity(y)) {
        point[1] = yAxis.toGlobalCoord(yAxis.getExtent()[dims[1] === 'y0' ? 0 : 1]);
      }
    }

    if (!isNaN(xPx)) {
      point[0] = xPx;
    }

    if (!isNaN(yPx)) {
      point[1] = yPx;
    }
  }

  return point;
}

var dimPermutations = [['x0', 'y0'], ['x1', 'y0'], ['x1', 'y1'], ['x0', 'y1']];

var MarkAreaView = function (_super) {
  __extends(MarkAreaView, _super);

  function MarkAreaView() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.type = MarkAreaView.type;
    return _this;
  }

  MarkAreaView.prototype.updateTransform = function (markAreaModel, ecModel, api) {
    ecModel.eachSeries(function (seriesModel) {
      var maModel = MarkerModel.getMarkerModelFromSeries(seriesModel, 'markArea');

      if (maModel) {
        var areaData_1 = maModel.getData();
        areaData_1.each(function (idx) {
          var points = map(dimPermutations, function (dim) {
            return getSingleMarkerEndPoint(areaData_1, idx, dim, seriesModel, api);
          });
          areaData_1.setItemLayout(idx, points);
          var el = areaData_1.getItemGraphicEl(idx);
          el.setShape('points', points);
        });
      }
    }, this);
  };

  MarkAreaView.prototype.renderSeries = function (seriesModel, maModel, ecModel, api) {
    var coordSys = seriesModel.coordinateSystem;
    var seriesId = seriesModel.id;
    var seriesData = seriesModel.getData();
    var areaGroupMap = this.markerGroupMap;
    var polygonGroup = areaGroupMap.get(seriesId) || areaGroupMap.set(seriesId, {
      group: new graphic.Group()
    });
    this.group.add(polygonGroup.group);
    this.markKeep(polygonGroup);
    var areaData = createList(coordSys, seriesModel, maModel);
    maModel.setData(areaData);
    areaData.each(function (idx) {
      var points = map(dimPermutations, function (dim) {
        return getSingleMarkerEndPoint(areaData, idx, dim, seriesModel, api);
      });
      var allClipped = true;
      each(dimPermutations, function (dim) {
        if (!allClipped) {
          return;
        }

        var xValue = areaData.get(dim[0], idx);
        var yValue = areaData.get(dim[1], idx);

        if ((isInifinity(xValue) || coordSys.getAxis('x').containData(xValue)) && (isInifinity(yValue) || coordSys.getAxis('y').containData(yValue))) {
          allClipped = false;
        }
      });
      areaData.setItemLayout(idx, {
        points: points,
        allClipped: allClipped
      });
      var style = areaData.getItemModel(idx).getModel('itemStyle').getItemStyle();
      var color = getVisualFromData(seriesData, 'color');

      if (!style.fill) {
        style.fill = color;

        if (typeof style.fill === 'string') {
          style.fill = colorUtil.modifyAlpha(style.fill, 0.4);
        }
      }

      if (!style.stroke) {
        style.stroke = color;
      }

      areaData.setItemVisual(idx, 'style', style);
    });
    areaData.diff(inner(polygonGroup).data).add(function (idx) {
      var layout = areaData.getItemLayout(idx);

      if (!layout.allClipped) {
        var polygon = new graphic.Polygon({
          shape: {
            points: layout.points
          }
        });
        areaData.setItemGraphicEl(idx, polygon);
        polygonGroup.group.add(polygon);
      }
    }).update(function (newIdx, oldIdx) {
      var polygon = inner(polygonGroup).data.getItemGraphicEl(oldIdx);
      var layout = areaData.getItemLayout(newIdx);

      if (!layout.allClipped) {
        if (polygon) {
          graphic.updateProps(polygon, {
            shape: {
              points: layout.points
            }
          }, maModel, newIdx);
        } else {
          polygon = new graphic.Polygon({
            shape: {
              points: layout.points
            }
          });
        }

        areaData.setItemGraphicEl(newIdx, polygon);
        polygonGroup.group.add(polygon);
      } else if (polygon) {
        polygonGroup.group.remove(polygon);
      }
    }).remove(function (idx) {
      var polygon = inner(polygonGroup).data.getItemGraphicEl(idx);
      polygonGroup.group.remove(polygon);
    }).execute();
    areaData.eachItemGraphicEl(function (polygon, idx) {
      var itemModel = areaData.getItemModel(idx);
      var style = areaData.getItemVisual(idx, 'style');
      polygon.useStyle(areaData.getItemVisual(idx, 'style'));
      setLabelStyle(polygon, getLabelStatesModels(itemModel), {
        labelFetcher: maModel,
        labelDataIndex: idx,
        defaultText: areaData.getName(idx) || '',
        inheritColor: typeof style.fill === 'string' ? colorUtil.modifyAlpha(style.fill, 1) : '#000'
      });
      setStatesStylesFromModel(polygon, itemModel);
      enableHoverEmphasis(polygon);
      getECData(polygon).dataModel = maModel;
    });
    inner(polygonGroup).data = areaData;
    polygonGroup.group.silent = maModel.get('silent') || seriesModel.get('silent');
  };

  MarkAreaView.type = 'markArea';
  return MarkAreaView;
}(MarkerView);

function createList(coordSys, seriesModel, maModel) {
  var coordDimsInfos;
  var areaData;
  var dims = ['x0', 'y0', 'x1', 'y1'];

  if (coordSys) {
    coordDimsInfos = map(coordSys && coordSys.dimensions, function (coordDim) {
      var data = seriesModel.getData();
      var info = data.getDimensionInfo(data.mapDimension(coordDim)) || {};
      return defaults({
        name: coordDim
      }, info);
    });
    areaData = new List(map(dims, function (dim, idx) {
      return {
        name: dim,
        type: coordDimsInfos[idx % 2].type
      };
    }), maModel);
  } else {
    coordDimsInfos = [{
      name: 'value',
      type: 'float'
    }];
    areaData = new List(coordDimsInfos, maModel);
  }

  var optData = map(maModel.get('data'), curry(markAreaTransform, seriesModel, coordSys, maModel));

  if (coordSys) {
    optData = filter(optData, curry(markAreaFilter, coordSys));
  }

  var dimValueGetter = coordSys ? function (item, dimName, dataIndex, dimIndex) {
    return item.coord[Math.floor(dimIndex / 2)][dimIndex % 2];
  } : function (item) {
    return item.value;
  };
  areaData.initData(optData, null, dimValueGetter);
  areaData.hasItemOption = true;
  return areaData;
}

export default MarkAreaView;