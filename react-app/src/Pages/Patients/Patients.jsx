import {Box,Typography,useTheme} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from "../../../themes";
import { mockDataTeam } from "../../data/mockData";
import Sidebar from '../../Scenes/global/SideBar';
import Topbar from '../../Scenes/global/TopBar';

const Patients = () => {
  return (
    <div> 
        <Topbar/>
      <Sidebar/>
      
    </div>
  )
}

export default Patients