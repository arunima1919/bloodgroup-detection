import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {

const [data,setData] = useState([]);

useEffect(()=>{
 fetchFingerprints();
},[])

const fetchFingerprints = async () =>{

 try{

 const res = await axios.get(
 "http://localhost:5000/admin/fingerprints", {
  withCredentials: true
}
 
);console.log(res.data);

 setData(res.data);

 }catch(err){
 console.error("Error fetching fingerprints",err);
 }

}

const verify = async(id,blood)=>{

 try{

 await axios.post(
 `http://localhost:5000/admin/verify/${id}`,
 {actual_blood:blood}, {
  withCredentials: true
}
 
);

 fetchFingerprints();

 }catch(err){
 console.error(err);
 }

}

return(

<div style={{padding:"40px"}}>

<h2>Admin Dashboard</h2>
<table border="1" cellPadding="10">

<thead>
<tr>
<th>ID</th>
<th>Predicted</th>
<th>Actual</th>
<th>Status</th>
<th>Uploaded By</th>
<th>Date</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{data.map(row=>(

<tr key={row.id}>

<td>{row.id}</td>

<td>{row.predicted_blood}</td>

<td>{row.actual_blood || "-"}</td>

<td>
{row.is_verified ? "Verified" : "Pending"}
</td>

<td>{row.uploaded_by}</td>

{/* <td>{row.created_at}</td> */}
<td>{row.created_at}</td>
<td>

{row.is_verified ? (

"Done"

):( 

<select onChange={(e)=>verify(row.id,e.target.value)}>

<option>Select Blood</option>
<option>A+</option>
<option>A-</option>
<option>B+</option>
<option>B-</option>
<option>AB+</option>
<option>AB-</option>
<option>O+</option>
<option>O-</option>

</select>

)}

</td>

</tr>

))}

</tbody>

</table>

</div>

)

}

export default AdminDashboard;