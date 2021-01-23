/*
Battery Alert - Get an alert when battery is low in gnome
Copyright (C) 2021  Tommy Alex

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>
*/

'use strict';

const Main = imports.ui.main;
const UPower = imports.ui.status.power.UPower;
const Extension = imports.misc.extensionUtils.getCurrentExtension();

function BatteryAlert() {
	this._init();
}

BatteryAlert.prototype = {
	__proto__: function() {
	},

	_init: function() {
		this.alertLevel = 25;
		this._lastStatus = -1;
		this._lastPercentage = -1;
		this._uPowerProxy = Main.panel.statusArea["aggregateMenu"]._power._proxy;
		this._uPowerSignal = this._uPowerProxy.connect('g-properties-changed', this._onPowerChange.bind(this));
	},

	isDischargeState: function(state) {
		if ( state == UPower.DeviceState.DISCHARGING ) return true;
		if ( state == UPower.DeviceState.PENDING_DISCHARGE ) return true;
		return false;
	},

	_notify: function(msg) {
		Main.notify(Extension.metadata.name, msg)
	},

	_onPowerChange: function() {
		if ( this._uPowerProxy.IsPresent
			&& this.isDischargeState(this._uPowerProxy.State)
		) {
			if ( this._uPowerProxy.Percentage <= this.alertLevel ) {
				if ( this._lastPercentage < 0 || this._lastPercentage > this.alertLevel ) {
					this._notify(`battery low: ${this._uPowerProxy.Percentage}%`);
				}
			} else if ( ! this.isDischargeState(this._lastStatus) ) {
				this._notify(`You are using battery!`);
			}
		}

		this._lastStatus = this._uPowerProxy.State;
		this._lastPercentage = this._uPowerProxy.Percentage;
	},

	destroy: function() {
		this._uPowerProxy.disconnect(this._uPowerSignal);
	},
}

let batteryAlert = null;

function init() {
}

function enable() {
	batteryAlert = new BatteryAlert();
}

function disable() {
	batteryAlert.destroy();
	batteryAlert = null;
}
