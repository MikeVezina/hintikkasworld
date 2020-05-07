import { MuddyChildren } from './../examples/muddy-children';
import { Environment } from './environment';
import {EnvironmentProxy} from "./environment-proxy";

describe('Environment', () => {
  it('should create an instance', () => {
    expect(new EnvironmentProxy(new MuddyChildren(2))).toBeTruthy();
  });
});
