<?php

require_once 'api/v3/utils.php';
require_once 'CRM/Core/DAO.php';
require_once 'CRM/Utils/Type.php';

class Civi_CRM_Attend_DAO extends CRM_Core_DAO
{
    /**
     * static instance to hold the table name
     *
     * @var string
     * @static
     */
    static $_tableName = 'civicrm_attend_contact';
    /**
     * static instance to hold the field values
     *
     * @var array
     * @static
     */
    static $_fields = null;
    /**
     * static instance to hold the FK relationships
     *
     * @var string
     * @static
     */
    static $_links = null;
    /**
     * static instance to hold the values that can
     * be imported
     *
     * @var array
     * @static
     */
    static $_import = null;
    /**
     * static instance to hold the values that can
     * be exported
     *
     * @var array
     * @static
     */
    static $_export = null;
    /**
     * static value to see if we should log any modifications to
     * this table in the civicrm_log table
     *
     * @var boolean
     * @static
     */
    static $_log = false;
    /**
     *
     * @var int unsigned
     */
    public $id;
    /**
     * Which Event the record is for
     *
     * @var int unsigned
     */
    public $event_id;
    /**
     * Which contact the record is for
     *
     * @var string
     */
    public $contact_id;
    /**
     * Which date the record is for
     *
     * @var string
     */
    public $date;

    /**
     * class constructor
     *
     * @access public
     */
    function __construct()
    {
        parent::__construct();
    }

    static function &add( &$params )
    {
        $bao = new Civi_CRM_Attend_DAO();
        if(array_key_exists('event_id',$params)) $bao->event_id = $params['event_id'];
        if(array_key_exists('contact_id',$params)) $bao->contact_id = $params['contact_id'];
        if(array_key_exists('date',$params)) $bao->date = $params['date'];
        $bao->save( );
        return $bao;
    }
    /**
     * return foreign links
     *
     * @access public
     * @return array
     */
    function &links()
    {
        if (!(self::$_links)) {
            self::$_links = array(
                'event_id' => 'civicrm_event:id',
                'contact_id' => 'civicrm_contact:id',
            );
        }
        return self::$_links;
    }
    /**
     * returns all the column names of this table
     *
     * @access public
     * @return array
     */
    function &fields()
    {
        if (!(self::$_fields)) {
            self::$_fields = array(
                'id' => array(
                    'name' => 'id',
                    'type' => CRM_Utils_Type::T_INT,
                    'required' => true,
                ) ,
                'event_id' => array(
                    'name' => 'event_id',
                    'type' => CRM_Utils_Type::T_INT,
                    'required' => true,
                    'FKClassName' => 'CRM_Core_DAO_Event',
                ) ,
                'contact_id' => array(
                    'name' => 'contact_id',
                    'type' => CRM_Utils_Type::T_INT,
                    'required' => true,
                    'FKClassName' => 'CRM_Core_DAO_Contact',
                ) ,
                'date' => array(
                    'name' => 'date',
                    'type' => CRM_Utils_Type::T_DATE,
                    'title' => ts('Date') ,
                    'required' => true
                )
            );
        }
        return self::$_fields;
    }
    /**
     * returns the names of this table
     *
     * @access public
     * @return string
     */
    function getTableName()
    {
        return self::$_tableName;
    }
    /**
     * returns if this table needs to be logged
     *
     * @access public
     * @return boolean
     */
    function getLog()
    {
        return self::$_log;
    }
    /**
     * returns the list of fields that can be imported
     *
     * @access public
     * return array
     */
    function &import($prefix = false)
    {
        if (!(self::$_import)) {
            self::$_import = array();
            $fields = self::fields();
            foreach($fields as $name => $field) {
                if (CRM_Utils_Array::value('import', $field)) {
                    if ($prefix) {
                        self::$_import['attend'] = & $fields[$name];
                    } else {
                        self::$_import[$name] = & $fields[$name];
                    }
                }
            }
        }
        return self::$_import;
    }
    /**
     * returns the list of fields that can be exported
     *
     * @access public
     * return array
     */
    function &export($prefix = false)
    {
        if (!(self::$_export)) {
            self::$_export = array();
            $fields = self::fields();
            foreach($fields as $name => $field) {
                if (CRM_Utils_Array::value('export', $field)) {
                    if ($prefix) {
                        self::$_export['attend'] = & $fields[$name];
                    } else {
                        self::$_export[$name] = & $fields[$name];
                    }
                }
            }
        }
        return self::$_export;
    }
}

class Civi_CRM_AttendEvent_DAO extends CRM_Core_DAO
{
    /**
     * static instance to hold the table name
     *
     * @var string
     * @static
     */
    static $_tableName = 'civicrm_attend_event';
    /**
     * static instance to hold the field values
     *
     * @var array
     * @static
     */
    static $_fields = null;
    /**
     * static instance to hold the FK relationships
     *
     * @var string
     * @static
     */
    static $_links = null;
    /**
     * static instance to hold the values that can
     * be imported
     *
     * @var array
     * @static
     */
    static $_import = null;
    /**
     * static instance to hold the values that can
     * be exported
     *
     * @var array
     * @static
     */
    static $_export = null;
    /**
     * static value to see if we should log any modifications to
     * this table in the civicrm_log table
     *
     * @var boolean
     * @static
     */
    static $_log = false;
    /**
     *
     * @var int unsigned
     */
    public $id;
    /**
     * Which Event the record is for
     *
     * @var int unsigned
     */
    public $event_id;
    /**
     * Does the event record attendence
     *
     * @var string
     */
    public $is_attend;


    /**
     * class constructor
     *
     * @access public
     */
    function __construct()
    {
        parent::__construct();
    }

    static function &add( &$params )
    {
        $bao = new Civi_CRM_AttendEvent_DAO();
        if(array_key_exists('event_id',$params)) $bao->event_id = $params['event_id'];
        if(array_key_exists('is_attend',$params)) $bao->is_attend = $params['is_attend'];
        $bao->save( );
        return $bao;
    }
    /**
     * return foreign links
     *
     * @access public
     * @return array
     */
    function &links()
    {
        if (!(self::$_links)) {
            self::$_links = array(
                'event_id' => 'civicrm_event:id'
            );
        }
        return self::$_links;
    }
    /**
     * returns all the column names of this table
     *
     * @access public
     * @return array
     */
    function &fields()
    {
        if (!(self::$_fields)) {
            self::$_fields = array(
                'id' => array(
                    'name' => 'id',
                    'type' => CRM_Utils_Type::T_INT,
                    'required' => true,
                ) ,
                'event_id' => array(
                    'name' => 'event_id',
                    'type' => CRM_Utils_Type::T_INT,
                    'required' => true,
                    'FKClassName' => 'CRM_Core_DAO_Event',
                ) ,
                'is_attend' => array(
                    'name' => 'is_attend',
                    'type' => CRM_Utils_Type::T_BOOL,
                    'required' => true,
                    'label' => "Is Attend"
                )
            );
        }
        return self::$_fields;
    }
    /**
     * returns the names of this table
     *
     * @access public
     * @return string
     */
    function getTableName()
    {
        return self::$_tableName;
    }
    /**
     * returns if this table needs to be logged
     *
     * @access public
     * @return boolean
     */
    function getLog()
    {
        return self::$_log;
    }
    /**
     * returns the list of fields that can be imported
     *
     * @access public
     * return array
     */
    function &import($prefix = false)
    {
        if (!(self::$_import)) {
            self::$_import = array();
        }
        return self::$_import;
    }
    /**
     * returns the list of fields that can be exported
     *
     * @access public
     * return array
     */
    function &export($prefix = false)
    {
        if (!(self::$_export)) {
            self::$_export = array();
        }
        return self::$_export;
    }
}



function civicrm_api3_attend_get_contact_record($params) {
    return _civicrm_api3_basic_get('Civi_CRM_Attend_DAO', $params, false);
}
function civicrm_api3_attend_create_contact_record($params) {
    return _civicrm_api3_basic_create('Civi_CRM_Attend_DAO', $params);
}
function civicrm_api3_attend_delete_contact_record($params) {
    return _civicrm_api3_basic_delete('Civi_CRM_Attend_DAO', $params);
}
function civicrm_api3_attend_set_contact_record($params){
    $bao = new Civi_CRM_Attend_DAO();
    if(!$params['id']) return civicrm_api3_create_error( 'no id found');
    $bao->id = $params['id'];
    $result = $bao->find();
    if(!$result) return civicrm_api3_create_error( 'no db object found');
    if(array_key_exists('event_id',$params)) $bao->event_id = $params['event_id'];
    if(array_key_exists('contact_id',$params)) $bao->contact_id = $params['contact_id'];
    if(array_key_exists('date',$params)) $bao->date = $params['date'];
    $bao->save();
    dpm($bao);
    return _civicrm_api3_dao_to_array ($bao);

}



function civicrm_api3_attend_get_event_record($params) {
    return _civicrm_api3_basic_get('Civi_CRM_AttendEvent_DAO', $params);
}
function civicrm_api3_attend_create_event_record($params) {
    return _civicrm_api3_basic_create('Civi_CRM_AttendEvent_DAO', $params);
}
function civicrm_api3_attend_delete_event_record($params) {
    return _civicrm_api3_basic_delete('Civi_CRM_AttendEvent_DAO', $params);
}


  
// Retrieves events that have the getEvents flag
function civicrm_api3_attend_getEvents($params){
  

  return array();
}
// Set the attend flag for an event
function civicrm_api3_attend_setEventFlag($params){
  $event_id = $params['event_id'];

  $query = "
      SELECT is_attend
      FROM   civicrm_attend_event
      WHERE  event_id='$event_id'
      LIMIT 1
    ";

  # run the query
  $dao = CRM_Core_DAO::executeQuery( $query );
  while($dao->fetch()){
    if(property_exists($dao, 'is_attend')){
      return $dao->is_attend;
    }
  }




  return true;
}
// Gets the attend flag for an event
function civicrm_api3_attend_getEventFlag($params){
  $event_id = $params['event_id'];
  $query = "
      SELECT is_attend
      FROM   civicrm_attend_event
      WHERE  event_id='$event_id'
      LIMIT 1
    ";

  # run the query
  $dao = CRM_Core_DAO::executeQuery( $query );
  while($dao->fetch()){
    if(property_exists($dao, 'is_attend')){
      return $dao->is_attend;
    }
  }
  // Return 0 by default
  return 0;
}

// Gets attendance information
// Optionally filtered by contact
// Optionally filtered by an event
// Optionally filtered by date
function civicrm_api3_attend_get($params){
  return "civi api attend get" . $params;
}

function civi_attend_get_contact_data($cid){
    $query = "
      SELECT *
      FROM   civicrm_attend_contact
      WHERE  contact_id='$cid'
      LIMIT 1000
    ";

    # run the query
    $dao = CRM_Core_DAO::executeQuery( $query );
    $results = array();
    while($dao->fetch()){
        $results[] = array(
            'eid' => $dao->event_id,
            'date' => $dao->date,
            'id' => $dao->id
        );
    }
    return $results;
}

function civi_attend_insert_contact_data($cid, $date, $eid){
    $query = "
      INSERT INTO civicrm_attend_contact (event_id, date, contact_id,...)
      VALUES ($eid, $date, $cid)
    ";

    # run the query
    $dao = CRM_Core_DAO::executeQuery( $query );
    $results = array();
    while($dao->fetch()){
        $results[] = array(
            'eid' => $dao->event_id,
            'date' => $dao->date,
            'id' => $dao->id
        );
    }
    return $results;
}

/*
function civicrm_api3_attend_getcontact($params){
    require_once 'api/api.php';
    $id = $params['id'];
    $contact = civicrm_api( 'contact','getsingle',array('id' => $id, 'version' => 3) );
    $contact['results'] = civi_attend_get_contact_data($id);
    return $contact;

}
function civicrm_api3_attend_setcontact($params){
    $id = $params['id'];
    $updated = array();
    foreach($params['result'] as $item){
        if($item['id']){
            $updated[] = civi_attend_update_contact_data($id, $item);
        } else {
             $updated[] = civi_attend_insert_contact_data($id, $item);
        }
    }
    require_once 'api/api.php';
    $contact = civicrm_api( 'contact','getsingle',array('id' => $id, 'version' => 3) );
    $contact['results'] = $updated;
    return $contact;


}
*/

