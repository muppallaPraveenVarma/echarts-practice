
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
import * as zrUtil from 'zrender/lib/core/util';
import * as graphic from '../../util/graphic';
import { enableHoverEmphasis, SPECIAL_STATES, DISPLAY_STATES } from '../../util/states';
import { createTextStyle } from '../../label/labelStyle';
import { getECData } from '../../util/innerStore';
import { getSectorCornerRadius } from '../helper/pieHelper';
import { createOrUpdatePatternFromDecal } from '../../util/decal';
var DEFAULT_SECTOR_Z = 2;
var DEFAULT_TEXT_Z = 4;

var SunburstPiece = function (_super) {
  __extends(SunburstPiece, _super);

  function SunburstPiece(node, seriesModel, ecModel, api) {
    var _this = _super.call(this) || this;

    _this.z2 = DEFAULT_SECTOR_Z;
    _this.textConfig = {
      inside: true
    };
    getECData(_this).seriesIndex = seriesModel.seriesIndex;
    var text = new graphic.Text({
      z2: DEFAULT_TEXT_Z,
      silent: node.getModel().get(['label', 'silent'])
    });

    _this.setTextContent(text);

    _this.updateData(true, node, seriesModel, ecModel, api);

    return _this;
  }

  SunburstPiece.prototype.updateData = function (firstCreate, node, seriesModel, ecModel, api) {
    this.node = node;
    node.piece = this;
    seriesModel = seriesModel || this._seriesModel;
    ecModel = ecModel || this._ecModel;
    var sector = this;
    getECData(sector).dataIndex = node.dataIndex;
    var itemModel = node.getModel();
    var emphasisModel = itemModel.getModel('emphasis');
    var layout = node.getLayout();
    var sectorShape = zrUtil.extend({}, layout);
    sectorShape.label = null;
    var normalStyle = node.getVisual('style');
    normalStyle.lineJoin = 'bevel';
    var decal = node.getVisual('decal');

    if (decal) {
      normalStyle.decal = createOrUpdatePatternFromDecal(decal, api);
    }

    var cornerRadius = getSectorCornerRadius(itemModel.getModel('itemStyle'), sectorShape);
    zrUtil.extend(sectorShape, cornerRadius);
    zrUtil.each(SPECIAL_STATES, function (stateName) {
      var state = sector.ensureState(stateName);
      var itemStyleModel = itemModel.getModel([stateName, 'itemStyle']);
      state.style = itemStyleModel.getItemStyle();
      var cornerRadius = getSectorCornerRadius(itemStyleModel, sectorShape);

      if (cornerRadius) {
        state.shape = cornerRadius;
      }
    });

    if (firstCreate) {
      sector.setShape(sectorShape);
      sector.shape.r = layout.r0;
      graphic.updateProps(sector, {
        shape: {
          r: layout.r
        }
      }, seriesModel, node.dataIndex);
    } else {
      graphic.updateProps(sector, {
        shape: sectorShape
      }, seriesModel);
    }

    sector.useStyle(normalStyle);

    this._updateLabel(seriesModel);

    var cursorStyle = itemModel.getShallow('cursor');
    cursorStyle && sector.attr('cursor', cursorStyle);
    this._seriesModel = seriesModel || this._seriesModel;
    this._ecModel = ecModel || this._ecModel;
    var focus = emphasisModel.get('focus');
    var focusDataIndices = focus === 'ancestor' ? node.getAncestorsIndices() : focus === 'descendant' ? node.getDescendantIndices() : null;
    enableHoverEmphasis(this, focusDataIndices || focus, emphasisModel.get('blurScope'));
  };

  SunburstPiece.prototype._updateLabel = function (seriesModel) {
    var _this = this;

    var itemModel = this.node.getModel();
    var normalLabelModel = itemModel.getModel('label');
    var layout = this.node.getLayout();
    var angle = layout.endAngle - layout.startAngle;
    var midAngle = (layout.startAngle + layout.endAngle) / 2;
    var dx = Math.cos(midAngle);
    var dy = Math.sin(midAngle);
    var sector = this;
    var label = sector.getTextContent();
    var dataIndex = this.node.dataIndex;
    var labelMinAngle = normalLabelModel.get('minAngle') / 180 * Math.PI;
    var isNormalShown = normalLabelModel.get('show') && !(labelMinAngle != null && Math.abs(angle) < labelMinAngle);
    label.ignore = !isNormalShown;
    zrUtil.each(DISPLAY_STATES, function (stateName) {
      var labelStateModel = stateName === 'normal' ? itemModel.getModel('label') : itemModel.getModel([stateName, 'label']);
      var isNormal = stateName === 'normal';
      var state = isNormal ? label : label.ensureState(stateName);
      var text = seriesModel.getFormattedLabel(dataIndex, stateName);

      if (isNormal) {
        text = text || _this.node.name;
      }

      state.style = createTextStyle(labelStateModel, {}, null, stateName !== 'normal', true);

      if (text) {
        state.style.text = text;
      }

      var isShown = labelStateModel.get('show');

      if (isShown != null && !isNormal) {
        state.ignore = !isShown;
      }

      var labelPosition = getLabelAttr(labelStateModel, 'position');
      var sectorState = isNormal ? sector : sector.states[stateName];
      var labelColor = sectorState.style.fill;
      sectorState.textConfig = {
        outsideFill: labelStateModel.get('color') === 'inherit' ? labelColor : null,
        inside: labelPosition !== 'outside'
      };
      var r;
      var labelPadding = getLabelAttr(labelStateModel, 'distance') || 0;
      var textAlign = getLabelAttr(labelStateModel, 'align');

      if (labelPosition === 'outside') {
        r = layout.r + labelPadding;
        textAlign = midAngle > Math.PI / 2 ? 'right' : 'left';
      } else {
        if (!textAlign || textAlign === 'center') {
          r = (layout.r + layout.r0) / 2;
          textAlign = 'center';
        } else if (textAlign === 'left') {
          r = layout.r0 + labelPadding;

          if (midAngle > Math.PI / 2) {
            textAlign = 'right';
          }
        } else if (textAlign === 'right') {
          r = layout.r - labelPadding;

          if (midAngle > Math.PI / 2) {
            textAlign = 'left';
          }
        }
      }

      state.style.align = textAlign;
      state.style.verticalAlign = getLabelAttr(labelStateModel, 'verticalAlign') || 'middle';
      state.x = r * dx + layout.cx;
      state.y = r * dy + layout.cy;
      var rotateType = getLabelAttr(labelStateModel, 'rotate');
      var rotate = 0;

      if (rotateType === 'radial') {
        rotate = -midAngle;

        if (rotate < -Math.PI / 2) {
          rotate += Math.PI;
        }
      } else if (rotateType === 'tangential') {
        rotate = Math.PI / 2 - midAngle;

        if (rotate > Math.PI / 2) {
          rotate -= Math.PI;
        } else if (rotate < -Math.PI / 2) {
          rotate += Math.PI;
        }
      } else if (typeof rotateType === 'number') {
        rotate = rotateType * Math.PI / 180;
      }

      state.rotation = rotate;
    });

    function getLabelAttr(model, name) {
      var stateAttr = model.get(name);

      if (stateAttr == null) {
        return normalLabelModel.get(name);
      }

      return stateAttr;
    }

    label.dirtyStyle();
  };

  return SunburstPiece;
}(graphic.Sector);

export default SunburstPiece;