import { useEffect, useState } from "react";
import axios from "axios";

function AdminResults() {

const [data,setData] = useState([]);

useEffect(()=>{
 fetchResults();
},[])

const fetchResults = async () =>{

 try{

 const res = await axios.get(
 "http://localhost:5000/admin/results",
 { withCredentials:true }
 );

 setData(res.data);

 }catch(err){
 console.error(err);
 }

}

return(

<div style={{padding:"40px"}}>

<h2>User Prediction Results</h2>

<table border="1" cellPadding="10">

<thead>
<tr>
<th>ID</th>
<th>User Name</th>
<th>Email</th>
<th>Predicted Blood</th>
<th>Confidence</th>
<th>Date</th>
</tr>
</thead>

<tbody>

{data.map(row=>(
<tr key={row.id}>

<td>{row.id}</td>
<td>{row.name}</td>
<td>{row.email}</td>
<td>{row.result}</td>
<td>{row.confidence}</td>
<td>{row.created_at}</td>

</tr>
))}

</tbody>

</table>

</div>

)

}

export default AdminResults;