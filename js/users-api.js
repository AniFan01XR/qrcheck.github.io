const KEY='qr_users';
export const getUsers =()=> JSON.parse(localStorage.getItem(KEY)||'[]');
export const setUsers =arr=> localStorage.setItem(KEY,JSON.stringify(arr));

export function addOrUpdate(u){
  const arr=getUsers();
  if(u.id){
    const i=arr.findIndex(x=>x.id===u.id); arr[i]=u;
  }else{
    u.id=Date.now(); arr.push(u);
  }
  setUsers(arr);
}
export const deleteUser=id=> setUsers(getUsers().filter(u=>u.id!==id));
