/**
 * @module store
 *
 */
import { allKeys } from './lib/keys';
import matchKeys   from './lib/match_keys';
import parseKeys   from './lib/parse_keys';
import uuid        from './lib/uuid';
import Immutable from 'immutable'

/**
 * private
 * 
 */

// dict for class prototypes => bindings
const _handlers2 = new Array();

// all mounted instances that have keybindings
const _instances2 = new Array();

// for testing
export function _resetStore() {
  _handlers2.splice(0,_handlers2.length);
  _instances2.splice(0,_instances2.length);
}


/**
 * public
 *
 */

const Store = {

  /**
   * activate
   *
   * @access public
   * @param {object} instance Instantiated class that extended React.Component, to be focused to receive keydown events
   */
  activate( instances ) {
    const instancesArray = [].concat( instances );

    // if no components were found as ancestors of the event target,
    // effectively deactivate keydown handling by capping the set of instances
    // with `null`.
    if ( !instancesArray.length ) {
       //_instances2.push( null );
    } else {
      
      // deleting and then adding the instance(s) has the effect of sorting the set
      // according to instance activation (ascending)
      instancesArray.forEach( instance => {
        let i = _instances2.length;
        while (i--) {
          if(_instances2[i] == instance){
             _instances2.pop();
          }
        }
        _instances2.push(instance);
      });
    }
  },

  /**
   * deleteInstance
   *
   * @access public
   * @param {object} target Instantiated class that extended React.Component
   * @return {boolean} The value set.has( target ) would have returned prior to deletion
   */
  deleteInstance( target ) {
    _instances.delete( target );
    let i = _instances2.length;
    while (i--) {
      if(_instances2[i] == target){
          _instances2.pop();
      }
    }
  },

  findBindingForEvent( event ) {
    if ( _instances2 ) {
      const keyMatchesEvent = keySet => matchKeys( { keySet, event } );

      let i = _instances2.length;
      while (i--) {
        let instance = _instances2[i]
        const bindings = this.getBinding( instance );
        for ( const [ keySets, fn ] of bindings ) {
          if ( allKeys( keySets ) || keySets.some( keyMatchesEvent ) ) {
            return { fn, instance };
          }
        }
      }

    }
    return null;
  },

  /**
   * getBinding
   *
   * @access public
   * @param {object} target Class used as key in dict of key bindings
   * @return {object} The object containing bindings for the given class
   */
  getBinding( { __reactKeydownUUID } ) {
    if(!_handlers2) return null;
    if(!__reactKeydownUUID) return null;
    let i = _handlers2.length;
    while (i--) {
      let instance = _handlers2[i];
      if(instance.targetUuid == __reactKeydownUUID){
        let keySets = instance.keySets;
        let fn = instance.fn; 
          return [[keySets, fn]];
      }
    }
  },

  /**
   * getInstances
   *
   * @access public
   * @return {set} All stored instances (all mounted component instances with keybindings)
   */
  getInstances() {
    return _instances2;
  },

  /**
   * isEmpty
   *
   * @access public
   * @return {number} Size of the set of all stored instances
   */
  isEmpty() {
    return !_instances2.size;
  },

  /**
   * setBinding
   *
   * @access public
   * @param {object} args All arguments necessary to set the binding
   * @param {array} args.keys Key codes that should trigger the fn
   * @param {function} args.fn The callback to be triggered when given keys are pressed
   * @param {object} args.target The decorated class
   */
  setBinding( { keys, fn, target } ) {
    const keySets = keys ? parseKeys( keys ) : allKeys() ;
    const { __reactKeydownUUID } = target;
    if ( !__reactKeydownUUID ) {
      target.__reactKeydownUUID = uuid();
      const targetUuid = target.__reactKeydownUUID;
      const hand = {
        targetUuid,
        keySets,
        fn
      }
      _handlers2.push(hand);
    } else {
      const targetUuid = target.__reactKeydownUUID;
      const hand = {
        targetUuid,
        keySets,
        fn
      }
      _handlers2.push(hand);
    }
  }
};

export default Store;
