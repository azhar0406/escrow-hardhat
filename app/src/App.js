import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';
import Escrow2 from './artifacts/contracts/Escrow.sol/Escrow';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const provider = new ethers.providers.Web3Provider(window.ethereum);



export async function approve(escrowContract, signer) {
  // const addressSigner = await signer.getAddress();
  // if (addressSigner !== arbiter) return toast.error('wallet no is arbiter');
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [newSource, setNewSource] = useState("");
  const [deployedAddresses, setDeployedAddresses] = useState();
  const [deployedAddresses_new, setDeployedAddresses_new] = useState([]);
  const [storedbeneficiary, setbeneficiary] = useState();
  const [storedarbiter, setarbiter] = useState();
  const [storedvalue, setvalue] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  useEffect(() => {
    const savedAddresses = JSON.parse(localStorage.getItem('deployedContracts_new') || '[]');
    setDeployedAddresses_new(savedAddresses);
    setNewSource(localStorage.getItem('deployedContracts') || '');
}, []);

useEffect(() => {
  
  const handleNewContract = async () => {
    if(localStorage.getItem('deployedContracts') !=="" && localStorage.getItem('deployedContracts') !==null){


      const beneficiary = localStorage.getItem('beneficiary');
      const arbiter = localStorage.getItem('arbiter');
      const inputElement = localStorage.getItem('value');

      setDeployedAddresses(localStorage.getItem('deployedContracts'));
      // setNewSource(localStorage.getItem('deployedContracts'));
      setbeneficiary(beneficiary);
      setarbiter(arbiter);
      setvalue(inputElement);

      // console.log(localStorage.getItem('deployedContracts'));

      // console.log(Escrow2.abi);

      const contractInstance = new ethers.Contract(localStorage.getItem('deployedContracts'), Escrow2.abi, provider.getSigner());
    
      
    
      const value = inputElement  && inputElement.trim() !== "" 
          ? inputElement 
          : "0";

          // console.log(value.toString());
          // ethers.utils.parseEther(document.getElementById('wei').value)
    
      const escrow = {
        address: localStorage.getItem('deployedContracts'),
        arbiter,
        beneficiary,
        value: value.toString(),
        handleApprove: async () => {
          const signer = provider.getSigner();
          // console.log(await signer.getAddress());
          // console.log(arbiter);
          if(arbiter != await signer.getAddress()){ return toast.error('Not Authorized') }
          contractInstance.on('Approved', () => {
            document.getElementById(localStorage.getItem('deployedContracts')).className =
              'complete';
            document.getElementById(localStorage.getItem('deployedContracts')).innerText =
              "✓ It's been approved!";
          });
    
          //console.log(contractInstance);

          await approve(contractInstance, provider.getSigner());
        },
      };
    
      setEscrows([...escrows, escrow]);
    } 
      const savedAddresses = localStorage.getItem('deployedContracts');
      const beneficiary = localStorage.getItem('beneficiary');
      const arbiter = localStorage.getItem('arbiter');
      const inputElement = localStorage.getItem('value');

      setDeployedAddresses(savedAddresses);
      setbeneficiary(beneficiary);
      setarbiter(arbiter);
      setvalue(inputElement);

    
    };

    handleNewContract();

}, []);




  async function newContract(check) {

    let beneficiary;
    let arbiter;
    let value;
    let escrowContract;
    let etherString;

    if(check=="false"){
      beneficiary = document.getElementById('beneficiary').value;
      arbiter = document.getElementById('arbiter').value;
      // const value = ethers.BigNumber.from(document.getElementById('wei').value);
      value = ethers.utils.parseEther(document.getElementById('wei').value);
      escrowContract = await deploy(signer, arbiter, beneficiary, value);
      if (document.getElementById('wei').value === "") return toast.error('value dont was provides')
    } else {

      
        escrowContract = new ethers.Contract(newSource, Escrow2.abi, provider.getSigner());
      
      beneficiary = await escrowContract.beneficiary();
      // console.log(beneficiary);
      arbiter = await escrowContract.arbiter();
      // console.log(arbiter);


      // const value = ethers.BigNumber.from(document.getElementById('wei').value);

      await provider.getBalance(newSource).then((balance) => {
        value = balance;
        //console.log("Balance: " + value);
    });

      // value = ethers.utils.parseEther(etherString);
      // const escrowContract = await deploy(signer, arbiter, beneficiary, value);
    }


    if (arbiter === "") return toast.error('arbiter dont was provides')
    if (arbiter.length < 42) return toast.error('arbiter address invalid')
    if (beneficiary === "") return toast.error('beneficiary dont was provides')
    if (beneficiary.length < 42) return toast.error('beneficiary address invalid')
  

// After successfully deploying the contract
//console.log(localStorage.getItem('deployedContracts'));

const savedContractDetailsString = localStorage.getItem('deployedContracts_new');

let savedContractDetails;
// console.log("saveddetails in");
// console.log(savedContractDetailsString);
if (savedContractDetailsString) {
    try {
        savedContractDetails = JSON.parse(savedContractDetailsString);
        // console.log("saveddetails");
    } catch (error) {
        console.error("Error parsing stored contract details:", error);
    }
}

// console.log("saveddetails out");
const deployedContracts = JSON.parse(localStorage.getItem('deployedContracts_new') || '[]');

// const deployedContracts = (localStorage.getItem('deployedContracts') || '[]');
deployedContracts.push(escrowContract.address);
localStorage.setItem('deployedContracts_new', JSON.stringify(deployedContracts));
setNewSource(escrowContract.address);
// deployedContracts.push(escrowContract.address); // assuming contractAddress is the address of your deployed contract
localStorage.setItem('deployedContracts', escrowContract.address);
localStorage.setItem('beneficiary', beneficiary);
localStorage.setItem('arbiter', arbiter);
localStorage.setItem('value', value);

// console.log(localStorage.getItem('deployedContracts'));
    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value?.toString() || value,
      handleApprove: async () => {
        const signer = provider.getSigner();
        if(arbiter != await signer.getAddress()){ return toast.error('Not Authorized')}
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    // setEscrows([...escrows, escrow]);
    setEscrows([escrow]);

  }
  const deployedContracts_check = localStorage.getItem('deployedContracts');

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>
{/* {console.log(newSource)} */}
        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in ether)
          <input type="text" id="wei" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract("false");
          }}
        >
          Deploy
        </div>
        <hr />
        <p className="textCenter" > Or </p>
        <label>
          Load From Contract
          <input type="text" id="contract" onChange={e => setNewSource(e.target.value)} defaultValue={newSource} />
          <div
          className="button"
          id="loadme"
          onClick={(e) => {
            e.preventDefault();

            newContract("true");
          }}
        >
          Load Me
        </div>
        </label>
      </div>
     
      {deployedContracts_check && (
      <div className="existing-contracts ">
        <h1> Existing Contracts </h1>
        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
        </div>
        <ToastContainer />
      </div>)}


      {/* <div className="contract2">
 
      </div> */}
    </>
  );
}

export default App;
