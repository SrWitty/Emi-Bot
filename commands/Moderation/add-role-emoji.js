const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-role-emoji')
    .setDescription('Adds an emoji to a specified role.')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to add the emoji to.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('The emoji to add to the role.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const { guild, user, options } = interaction;
    const role = options.getRole('role');
    const emoji = options.getString('emoji');
    
    // Check if user has permission to manage roles
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({ content: `You **do not** have the permission to do that!`, ephemeral: true});
    
    // Add emoji to role
    try {
      await role.edit({ hoist: true }); // make role hoisted to show emoji
      await role.setName(`${role.name} ${emoji}`); // add emoji to the role name
    } catch (error) {
      console.error(error);
      return interaction.reply(`Error adding emoji '${emoji}' to role '${role.name}'.`);
    }
    
    // Send DM to user
    try {
      await user.send(`Your emoji role add has been completed for role '${role.name}' with emoji '${emoji}'.`);
    } catch (error) {
      console.error(error);
      return interaction.reply(`Error sending DM to user '${user.username}'.`);
    }
    
    // Reply to interaction
    return interaction.reply(`Emoji '${emoji}' added to role '${role.name}'.`);
  },
};

