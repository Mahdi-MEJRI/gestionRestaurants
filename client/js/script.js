window.onload = init;

function init() {
  // appelée uniquement quand la page a chargé toutes ses
  // ressources
  
  //Component pour afficher le détail d'un restaurant 
  const RestaurantDetail = {
    props: ['id'],
    // Si retaurant est non null
    template: `<div v-if = "restaurant" style="padding:100px; padding-bottom:0px; padding-top:50px; display:flex; " >
              
    
            
    <div  >  
    <v-card
    class="mx-auto"
    max-width="600"
    tile
    style="display:flex; padding:20px;" >
              <div>
    
                <h3>Détails du restaurant : </h3>
                <br>

                <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Id</v-list-item-title>
                  <v-list-item-subtitle>{{restaurant._id}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

                <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Nom</v-list-item-title>
                  <v-list-item-subtitle>{{restaurant.name}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
                  <v-list-item two-line>
                    <v-list-item-content>
                      <v-list-item-title>Cuisine</v-list-item-title>
                      <v-list-item-subtitle>{{restaurant.cuisine}}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title>Ville</v-list-item-title>
                    <v-list-item-subtitle>{{restaurant.borough}}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item two-line>
                <v-list-item-content>
                  <v-list-item-title>Adresse</v-list-item-title>
                  <v-list-item-subtitle>{{restaurant.address.building}}, {{restaurant.address.street}}, {{restaurant.address.zipcode}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              </div>

             <div >
             <br><br>
              <v-list-item three-line>
      <v-list-item-content>
        <v-list-item-title>Notes</v-list-item-title>
        <v-list-item-subtitle v-for="r,index in restaurant.grades">
        <v-list-item three-line>
        <v-list-item-content>
          <v-list-item-subtitle>Date: {{ restaurant.grades[index].date }}</v-list-item-subtitle>
              <v-list-item-subtitle>Note: {{ restaurant.grades[index].grade }}</v-list-item-subtitle>
              <v-list-item-subtitle>Score: {{ restaurant.grades[index].score }}</v-list-item-subtitle>  
              </v-list-item-content>
            </v-list-item>   
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    </div>
    </v-card>
                  
            </div>
            <v-spacer></v-spacer>
            <div>
            
                  <iframe 
                  ref = "carte"
                  style=" border: none;box-shadow: 1px 1px 3px black;float: left; margin: 0 2em 2em 0;width:600px; height:480px;" 
                  src = ""
                 >
                   </iframe>
            </div>     
              </div>`,
    data : function() {
            return {
              restaurant : null,
              lien : ""
            }
    },

    

    mounted() {
      console.log("id = " + this.id)
      // On fait un fitch pour récuperer les données du restaurant 
      let url = "http://localhost:8080/api/restaurants/" + this.id;
      fetch(url)
        .then(responseJSON => {
          return responseJSON.json();
           }).then(data => {
                      this.restaurant = data.restaurant
                      // On envoie la latitude et la longitude pour avoir la position du restaurant 
                      this.lien = "http://www.openstreetmap.org/export/embed.html?bbox=" + this.restaurant.address.coord[0] + "%2C" + this.restaurant.address.coord[1] + "%2C" + this.restaurant.address.coord[0] + "%2C" + this.restaurant.address.coord[1] + "&amp;layer=mapnik"
                      // On affecte le lien de la carte à l'iframe
                      this.$nextTick(() => {
                         this.$refs.carte.src = this.lien
                      });                       
    })
  }
}


  // Route pour afficher le détail d'un restaurant 
  Vue.use(VueRouter);
  const router = new VueRouter({
    routes: [
        {
          path: '/RestaurantDetail/:id',
          component:  RestaurantDetail, 
          props: true
        }
    ],
  })

  new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    router,
    data: {
      restaurants: [],
      nom: "",
      cuisine: "",
      borough:"",
      nbRestaurantsTotal: 0,
      page: 0,
      pagesize: 10,
      nbPagesTotal: 0,
      msg: "",
      nomRestauRecherche: "",
      dialog: false,
    },
    mounted() {
      console.log("AVANT AFFICHAGE");
      this.getRestaurantsFromServer();
      
    },
    methods: {
      pagePrecedente() {
        if (this.page === 0) return;

        this.page--;
        this.getRestaurantsFromServer();
      },
      pageSuivante() {
        if (this.page === this.dernierePage) return;
        this.page++;
        this.getRestaurantsFromServer();
      },
      getRestaurantsFromServer() {
        let url = "http://localhost:8080/api/restaurants?";
        url += "page=" + this.page;
        url += "&pagesize=" + this.pagesize;
        url += "&name=" + this.nomRestauRecherche;

        fetch(url)
          .then((responseJSON) => {
            // arrow functions, conserve le bon "this"
            // la réponse est en JSON, on la convertit avec la ligne suivante
            responseJSON.json().then((resJS) => {
              // Maintenant resJS est un vrai objet JavaScript
              this.restaurants = resJS.data;
              this.nbRestaurantsTotal = resJS.count;
              this.nbPagesTotal = Math.round(
                this.nbRestaurantsTotal / this.pagesize
              );
            });
          })
          .catch(function (err) {
            console.log(err);
          });
      },
      chercherRestaurants: _.debounce(function () {
        // appelée que si on n'a pas tapé de touches pendant un certain délai
        this.getRestaurantsFromServer();
      }, 300),
      supprimerRestaurant(r) {
        let url = "http://localhost:8080/api/restaurants/" + r._id;

        fetch(url, {
            method: "DELETE",
          })
            .then((responseJSON) => {
              responseJSON.json().then((resJS) => {
                // Maintenant res est un vrai objet JavaScript
                console.log(resJS.msg);
                this.msg = resJS.msg;
                // On rafraichit la vue
                this.getRestaurantsFromServer();
              });
            })
            .catch(function (err) {
              console.log(err);
            });
            alert("Supression réussie !");
      },
      ajouterRestaurant(event) {
        // Récupération du formulaire. Pas besoin de document.querySelector
        // ou document.getElementById puisque c'est le formulaire qui a généré
        // l'événement
        let form = event.target;

        // Récupération des valeurs des champs du formulaire
        // en prévision d'un envoi multipart en ajax/fetch
        let donneesFormulaire = new FormData(form);

        let url = "http://localhost:8080/api/restaurants";

        fetch(url, {
          method: "POST",
          body: donneesFormulaire,
        })
          .then((responseJSON) => {
            responseJSON.json().then((resJS) => {
              // Maintenant res est un vrai objet JavaScript
              console.log(resJS.msg);
              this.msg = resJS.msg;
              // On rafraichit la vue
              this.getRestaurantsFromServer();
            });
          })
          .catch(function (err) {
            console.log(err);
          });

        this.nom = "";
        this.cuisine = "";
        this.borough = "";
        alert("Restaurant ajouté avec succés !!");
      },
      getColor(index) {
        return index % 2 ? "lightBlue" : "pink";
      },
      detailRestaurant(r) {
        let url = "http://localhost:8080/api/restaurants/" + r._id;
        window.location.href = url;
      },
    },
  });
 
}




