const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/User')

//Controller permettant de créer un compte sur le site
exports.signup = (req, res, next) => {

    //Hash du mot de passe pour plus de sécurité
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            })
            //Sauvegarde de l'utilisateur dans la db
            user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur enregistré !' }))
            .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))
}

//Controller permettant de se connecter sur le site
exports.login = (req, res, next) => {
    //Recherche de l'utilisateur et comparaison paire email/mdp
    User.findOne({ email: req.body.email })
       .then(user => {
           if (!user) {
               return res.status(401).json({ message: 'Paire email/mot de passe incorrecte'});
           }
           bcrypt.compare(req.body.password, user.password)
               .then(valid => {
                   if (!valid) {
                       return res.status(401).json({ message: 'Paire email/mot de passe incorrecte' });
                   }
                   //Création d'un token d'identification pour une durée de 24h
                   res.status(200).json({
                       userId: user._id,
                       token: jwt.sign(
                        { userId: user._id },
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: '24h' })
                   });
               })
               .catch(error => res.status(500).json({ error }));
       })
       .catch(error => res.status(500).json({ error }));

}