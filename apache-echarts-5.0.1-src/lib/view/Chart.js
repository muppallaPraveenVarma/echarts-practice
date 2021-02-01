
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

import { each } from 'zrender/lib/core/util';
import Group from 'zrender/lib/graphic/Group';
import * as componentUtil from '../util/component';
import * as clazzUtil from '../util/clazz';
import * as modelUtil from '../util/model';
import { enterEmphasis, leaveEmphasis, getHighlightDigit } from '../util/states';
import { createTask } from '../core/task';
import createRenderPlanner from '../chart/helper/createRenderPlanner';
var inner = modelUtil.makeInner();
var renderPlanner = createRenderPlanner();

var ChartView = function () {
  function ChartView() {
    this.group = new Group();
    this.uid = componentUtil.getUID('viewChart');
    this.renderTask = createTask({
      plan: renderTaskPlan,
      reset: renderTaskReset
    });
    this.renderTask.context = {
      view: this
    };
  }

  ChartView.prototype.init = function (ecModel, api) {};

  ChartView.prototype.render = function (seriesModel, ecModel, api, payload) {};

  ChartView.prototype.highlight = function (seriesModel, ecModel, api, payload) {
    toggleHighlight(seriesModel.getData(), payload, 'emphasis');
  };

  ChartView.prototype.downplay = function (seriesModel, ecModel, api, payload) {
    toggleHighlight(seriesModel.getData(), payload, 'normal');
  };

  ChartView.prototype.remove = function (ecModel, api) {
    this.group.removeAll();
  };

  ChartView.prototype.dispose = function (ecModel, api) {};

  ChartView.prototype.updateView = function (seriesModel, ecModel, api, payload) {
    this.render(seriesModel, ecModel, api, payload);
  };

  ChartView.prototype.updateLayout = function (seriesModel, ecModel, api, payload) {
    this.render(seriesModel, ecModel, api, payload);
  };

  ChartView.prototype.updateVisual = function (seriesModel, ecModel, api, payload) {
    this.render(seriesModel, ecModel, api, payload);
  };

  ChartView.markUpdateMethod = function (payload, methodName) {
    inner(payload).updateMethod = methodName;
  };

  ChartView.protoInitialize = function () {
    var proto = ChartView.prototype;
    proto.type = 'chart';
  }();

  return ChartView;
}();

;

function elSetState(el, state, highlightDigit) {
  if (el) {
    (state === 'emphasis' ? enterEmphasis : leaveEmphasis)(el, highlightDigit);
  }
}

function toggleHighlight(data, payload, state) {
  var dataIndex = modelUtil.queryDataIndex(data, payload);
  var highlightDigit = payload && payload.highlightKey != null ? getHighlightDigit(payload.highlightKey) : null;

  if (dataIndex != null) {
    each(modelUtil.normalizeToArray(dataIndex), function (dataIdx) {
      elSetState(data.getItemGraphicEl(dataIdx), state, highlightDigit);
    });
  } else {
    data.eachItemGraphicEl(function (el) {
      elSetState(el, state, highlightDigit);
    });
  }
}

clazzUtil.enableClassExtend(ChartView, ['dispose']);
clazzUtil.enableClassManagement(ChartView);

function renderTaskPlan(context) {
  return renderPlanner(context.model);
}

function renderTaskReset(context) {
  var seriesModel = context.model;
  var ecModel = context.ecModel;
  var api = context.api;
  var payload = context.payload;
  var progressiveRender = seriesModel.pipelineContext.progressiveRender;
  var view = context.view;
  var updateMethod = payload && inner(payload).updateMethod;
  var methodName = progressiveRender ? 'incrementalPrepareRender' : updateMethod && view[updateMethod] ? updateMethod : 'render';

  if (methodName !== 'render') {
    view[methodName](seriesModel, ecModel, api, payload);
  }

  return progressMethodMap[methodName];
}

var progressMethodMap = {
  incrementalPrepareRender: {
    progress: function (params, context) {
      context.view.incrementalRender(params, context.model, context.ecModel, context.api, context.payload);
    }
  },
  render: {
    forceFirstProgress: true,
    progress: function (params, context) {
      context.view.render(context.model, context.ecModel, context.api, context.payload);
    }
  }
};
export default ChartView;