//@ts-nocheck

import { APIMessage } from "discord.js";
import Util from "../Util";
import { MessageButton } from "./MessageButton";

class sendAPICallback extends APIMessage {
  resolveData() {
    if (this.data) {
      return this;
    }

    super.resolveData();
    
    if (this.options.flags) {
      this.data.flags = parseInt(this.options.flags);
    }

    if (
      typeof this.options.ephemeral === "boolean" &&
      this.options.ephemeral === true
    ) {
      this.data.flags = 64;
    }

    const buttons = [];
    if (this.options.type === 2) {
      buttons.push(Util.resolveButton(this.options));
    } else if (this.options.buttons) {
      this.options.buttons.map((x) => buttons.push(Util.resolveButton(x)));
    } else if (this.options.button) {
      buttons.push(Util.resolveButton(this.options.button));
    }

    if (buttons.length) {
      this.data.components = [
        {
          type: 1,
          components: buttons,
        },
      ];
    }

    return this;
  }
}

class APIMessageMain extends APIMessage {
  resolveData() {
    if (this.data) {
      return this;
    }

    super.resolveData();

    const buttons = [];
    if (this.options.type === 2) {
      buttons.push(Util.resolveButton(this.options));
    } else if (this.options.buttons) {
      this.options.buttons.map((x) => {
        buttons.push(Util.resolveButton(x))
        if (!x.url) {
          this.target.client.buttons[x.custom_id] = (data) => x.emit("click", data)
        }
      });
    } else if (this.options.button) {
      const button = this.options.button
      buttons.push(Util.resolveButton(button));
      this.target.client.buttons[button.custom_id] = (data) => button.emit("click", data)
    }

    if (buttons.length) {
      this.data.components = [
        {
          type: 1,
          components: buttons,
        },
      ];
    }

    return this;
  }
}

module.exports = {
  sendAPICallback,
  APIMessageMain,
};
