function pters_option_inspector(type, option_data, func){
    switch(type){
        case "plan_create":
            
        break;

        case "plan_delete":
                return false;
        break;

        case "plan_read":

        break;

        case "plan_update":

        break;
    }

    func();
}
