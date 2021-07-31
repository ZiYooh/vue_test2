import Web3 from "web3";
import votingArtifact from "../../build/contracts/Voting.json";

let candidates = {"후보1": "candidate-1", "후보2": "candidate-2", "후보3": "candidate-3"}

const App = {
  web3: null,
  account: null,
  voting: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = votingArtifact.networks[networkId];
      this.voting = new web3.eth.Contract(
        votingArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      this.loadCandidatesAndVotes();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  loadCandidatesAndVotes: async function() {
    // The line below loads the totalVotesFor method from the list of methods 
    // returned by this.voting.methods
    const { totalVotesFor } = this.voting.methods;
    let candidateNames = Object.keys(candidates);
    for (var i = 0; i < candidateNames.length; i++) {
      let name = candidateNames[i];
      var count = await totalVotesFor(this.web3.utils.asciiToHex(name)).call();
      $("#" + candidates[name]).html(count);
    }
  },

  voteForCandidate: async function() {
    let candidateName = $('#candidate').val();
    $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
    $("#candidate").val("");

    const { totalVotesFor, voteForCandidate } = this.voting.methods;
    await voteForCandidate(this.web3.utils.asciiToHex(candidateName)).send({gas: 140000, from: this.account});
    let div_id = candidates[candidateName];
    var count = await totalVotesFor(this.web3.utils.asciiToHex(candidateName)).call();
    $("#" + div_id).html(count);
    $("#msg").html("");
  }
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
  // use MetaMask's provider
  App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545"), // Ganache Port = 7545
    );
  }
  App.start();
});

/* 사이드바 관련 코드 */
/* EXPANDER MENU */
const showMenu = (toggleId, navbarId, bodyId) => {
  const toggle = document.getElementById(toggleId),
  navbar = document.getElementById(navbarId),
  bodypadding = document.getElementById(bodyId)

  if( toggle && navbar ) {
      toggle.addEventListener('click', ()=>{
          navbar.classList.toggle('expander');

          bodypadding.classList.toggle('body-pd')
      })
  }
}

showMenu('nav-toggle', 'navbar', 'body-pd')

/* LINK ACTIVE */
const linkColor = document.querySelectorAll('.nav__link')
function colorLink() {
  linkColor.forEach(l=> l.classList.remove('active'))
  this.classList.add('active')
}
linkColor.forEach(l=> l.addEventListener('click', colorLink))

/* COLLAPSE MENU */
const linkCollapse = document.getElementsByClassName('collapse__link')
var i

for(i=0;i<linkCollapse.length;i++) {
  linkCollapse[i].addEventListener('click', function(){
      const collapseMenu = this.nextElementSibling
      collapseMenu.classList.toggle('showCollapse')

      const rotate = collapseMenu.previousElementSibling
      rotate.classList.toggle('rotate')
  });
}