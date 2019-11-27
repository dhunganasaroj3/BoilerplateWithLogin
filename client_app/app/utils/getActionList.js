/**
 * Created by narahari on 1/8/18.
 */
import jwtDecode from 'jwt-decode';

const getActionList = () => {
  const token = localStorage.getItem('token');
  const userRole='';
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      if(decodedToken.user.user_role[0]!='superadmin'){
        const allowed_action = localStorage.getItem('allowed_actions');
        const action_list=[];
        if (allowed_action) {
          try {
            const decodedActions = jwtDecode(allowed_action);
            decodedActions.allowed_actions.map(group_list=>(
                group_list.allowed_actions.map(action_group=>(
                    action_list.push(action_group.action_title)
                ))
            ))
          } catch (error) {
            localStorage.clear();
          }
          return action_list;
        }

      }
    } catch (error) {
      localStorage.clear();
    }

  }
};

const getRole = () =>{
  const token = localStorage.getItem('token');
  let userRole='';
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userRole = decodedToken.user.user_role[0];
    }
    catch (error){
      localStorage.clear();
    }
    return userRole;

  }
}

export default {getActionList: getActionList,
getRole: getRole};
